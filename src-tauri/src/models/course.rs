use chrono::{NaiveDate, NaiveTime, TimeZone};
use chrono_tz::Asia::Ho_Chi_Minh;
use comfy_table::Table;
use icalendar::Component;
use icalendar::{Calendar, Event, EventLike};
use regex::Regex;
use serde::Deserialize;
use std::io::Write;
use std::path::PathBuf;
use std::{collections::HashMap, fs::File};

use crate::features::dut_fetch::config::read_config;
use crate::utils::parse_date::parse_date;
use crate::utils::period_times_dut::{period_end_times, period_start_times};

#[allow(dead_code)]
pub trait PrintTerminal {
    fn print_course(&self);
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Course {
    pub index: usize,
    #[serde(rename = "courseCode")]
    pub course_code: String,
    #[serde(rename = "courseName")]
    pub course_name: String,
    pub credit: u8,
    pub lecturer: String,
    pub schedule: String,
    pub weeks: String,
    #[serde(rename = "registrationTime")]
    pub registration_time: String,
    pub retake: bool,
    pub registered: String,
    #[serde(rename = "isClc")]
    pub is_clc: bool,
}

#[derive(Debug)]
struct Schedule {
    class_id: String,
    subject: String,
    teacher: String,
    day: u32,
    start_period: u32,
    end_period: u32,
    room: String,
    start_week: u32,
    end_week: u32,
}

impl PrintTerminal for Vec<Course> {
    fn print_course(&self) {
        let mut table = Table::new();
        table.add_row(vec![
            "ID",
            "Course ID",
            "Course Name",
            "Credit",
            "Teacher",
            "Schedule",
            "Week",
        ]);
        for course in self {
            table.add_row(vec![
                &course.index.to_string(),
                &course.course_code,
                &course.course_name,
                &course.credit.to_string(),
                &course.lecturer,
                &course.schedule,
                &course.weeks,
            ]);
        }

        println!("{table}");
    }
}

#[derive(Debug, Deserialize)]
pub struct Courses {
    pub courses: Vec<Course>,
    pub path: String,
}

fn extract_schedule_items(course: &Course) -> Vec<Schedule> {
    let re_day = Regex::new(r"(?:Thứ\s*)?(\d+),\s*(\d+)-(\d+),\s*(\w+)").unwrap();

    let re_week = Regex::new(r"(\d+)-(\d+)").unwrap();

    let mut result = vec![];
    for cap_week in re_week.captures_iter(&course.weeks) {
        let start_week = cap_week[1].parse::<u32>().unwrap();
        let end_week = cap_week[2].parse::<u32>().unwrap();

        for cap in re_day.captures_iter(&course.schedule) {
            result.push(Schedule {
                day: cap[1].parse().unwrap(),
                start_period: cap[2].parse().unwrap(),
                end_period: cap[3].parse().unwrap(),
                room: cap[4].to_string(),
                subject: course.course_name.clone(),
                teacher: course.lecturer.clone(),
                class_id: course.course_code.clone(),
                start_week,
                end_week,
            });
        }
    }
    // for re in &result {
    //     println!("{re:?}");
    // }

    result
}

async fn export_to_ics(
    schedules: &[Schedule],
    output_path_str: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut calendar = Calendar::new();
    let mut output_path = PathBuf::from(output_path_str);

    let config = read_config().await?;
    let (day, month, year) = parse_date(&config.start_date);
    let academic_year_start_date = NaiveDate::from_ymd_opt(year, month, day).unwrap();

    let period_start_times: HashMap<u32, NaiveTime> = period_start_times();
    let period_end_times: HashMap<u32, NaiveTime> = period_end_times();

    for schedule_item in schedules {
        for week_num in schedule_item.start_week..=schedule_item.end_week {
            let days_offset = (week_num - 1) * 7 + (schedule_item.day - 2);
            let event_date = academic_year_start_date + chrono::Duration::days(days_offset as i64);

            if let (Some(start_time), Some(end_time)) = (
                period_start_times.get(&schedule_item.start_period),
                period_end_times.get(&schedule_item.end_period),
            ) {
                let start_datetime = Ho_Chi_Minh
                    .from_local_datetime(&event_date.and_time(*start_time))
                    .unwrap();
                let end_datetime = Ho_Chi_Minh
                    .from_local_datetime(&event_date.and_time(*end_time))
                    .unwrap();

                let event = Event::new()
                    .summary(&schedule_item.subject)
                    .description(&format!(
                        "Mã HP: {}\nGV: {}\nPhòng: {}",
                        schedule_item.class_id, schedule_item.teacher, schedule_item.room
                    ))
                    .location(&schedule_item.room)
                    .starts(icalendar::CalendarDateTime::from(
                        start_datetime.with_timezone(&chrono::Utc),
                    ))
                    .ends(icalendar::CalendarDateTime::from(
                        end_datetime.with_timezone(&chrono::Utc),
                    ))
                    .status(icalendar::EventStatus::Confirmed)
                    .done();

                calendar.push(event);
            }
        }
    }
    output_path.push("ics_download.ics");
    let mut file = File::create(output_path)?;

    write!(file, "{}", calendar)?;

    Ok(())
}

pub async fn build_ics_calendar_from_courses(
    courses: &[Course],
    output_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let all_schedules: Vec<Schedule> = courses.iter().flat_map(extract_schedule_items).collect();

    export_to_ics(&all_schedules, output_path).await?;
    Ok(())
}

#[tauri::command]
pub async fn convert_schedule_to_ics(payload: Courses) -> Result<(), String> {
    build_ics_calendar_from_courses(&payload.courses, &payload.path)
        .await
        .map_err(|e| format!("Failed to generate ICS: {}", e))?;

    Ok(())
}

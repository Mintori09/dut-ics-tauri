use chrono::{NaiveDate, NaiveTime, TimeZone};
use chrono_tz::Asia::Ho_Chi_Minh;
use comfy_table::Table;
use icalendar::Component;
use icalendar::{Calendar, Event, EventLike};
use regex::Regex;
use std::io::Write;
use std::path::PathBuf;
use std::{collections::HashMap, fs::File};

pub trait PrintTerminal {
    fn print_course(&self);
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Course {
    pub index: usize,
    pub course_code: String,
    pub course_name: String,
    pub credit: u8,
    pub lecturer: String,
    pub schedule: String,
    pub weeks: String,
    pub registration_time: String,
    pub retake: bool,
    pub registered: String,
    pub is_clc: bool,
}

#[derive(Debug)]
struct ScheduleItem {
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

pub async fn parse_courses(input: &str) -> Result<Vec<Course>, String> {
    // Tách từng token (dựa trên space)
    let tokens: Vec<&str> = input.split_whitespace().collect();

    let mut courses = Vec::new();
    let mut i = 0;

    while i < tokens.len() {
        // Cố gắng parse 11 trường theo thứ tự:
        // index, course_code, course_name (nhiều từ), credit, lecturer (nhiều từ), schedule (nhiều từ),
        // weeks, registration_time (2 token), retake, registered, is_clc (có thể missing)

        // index
        let index = tokens[i]
            .parse::<usize>()
            .map_err(|_| format!("Invalid index at token {}", i))?;
        i += 1;

        // course_code
        let course_code = tokens.get(i).ok_or("Missing course_code")?.to_string();
        i += 1;

        // course_name: gồm nhiều từ, dừng khi gặp token là số (credit)
        let mut course_name_words = Vec::new();
        while i < tokens.len() {
            if tokens[i].parse::<u8>().is_ok() {
                // credit bắt đầu
                break;
            }
            course_name_words.push(tokens[i]);
            i += 1;
        }
        if course_name_words.is_empty() {
            return Err("Missing course_name".to_string());
        }
        let course_name = course_name_words.join(" ");

        // credit
        let credit = tokens
            .get(i)
            .ok_or("Missing credit")?
            .parse::<u8>()
            .map_err(|_| "Invalid credit")?;
        i += 1;

        // lecturer: nhiều từ, dừng khi gặp token bắt đầu bằng "Thứ" (schedule)
        let mut lecturer_words = Vec::new();
        while i < tokens.len() {
            if tokens[i].starts_with("Thứ") {
                break;
            }
            lecturer_words.push(tokens[i]);
            i += 1;
        }
        if lecturer_words.is_empty() {
            return Err("Missing lecturer".to_string());
        }
        let lecturer = lecturer_words.join(" ");
        // schedule: nhiều token bắt đầu bằng "Thứ" và các token sau đó (có thể chứa dấu ;)
        let mut schedule_words = Vec::new();
        while i < tokens.len() {
            // Dừng khi gặp tuần học (dạng số hoặc dạng 49-52)
            let token = tokens[i];
            if token.chars().all(|c| c.is_ascii_digit() || c == '-') {
                break;
            }
            schedule_words.push(token);
            i += 1;
        }
        if schedule_words.is_empty() {
            return Err("Missing schedule".to_string());
        }
        let schedule = schedule_words.join(" ");

        // weeks (ví dụ: "49-52")
        let weeks = tokens.get(i).ok_or("Missing weeks")?.to_string();
        i += 1;

        // registration_time: 2 token, ví dụ "6/3/2025 7:13:45"
        if i + 1 >= tokens.len() {
            return Err("Missing registration time".to_string());
        }
        let registration_time = format!("{} {}", tokens[i], tokens[i + 1]);
        i += 2;

        // retake (ký hiệu X hoặc trống -> bool)
        let retake_token = tokens.get(i).unwrap_or(&"");
        let retake = *retake_token == "X";
        if retake_token != &"" {
            i += 1;
        }

        // registered (ví dụ: "89/90")
        let registered = tokens.get(i).unwrap_or(&"").to_string();
        if !registered.is_empty() {
            i += 1;
        }

        // is_clc: có thể có hoặc không, ví dụ "X" hoặc ""
        let is_clc_token = tokens.get(i).unwrap_or(&"");
        let is_clc = *is_clc_token == "X";
        if is_clc_token != &"" {
            i += 1;
        }

        courses.push(Course {
            index,
            course_code,
            course_name,
            credit,
            lecturer,
            schedule,
            weeks,
            registration_time,
            retake,
            registered,
            is_clc,
        });
    }

    Ok(courses)
}

pub async fn parse_courses_from_lines(input: &str) -> Result<Vec<Course>, String> {
    let mut lines = input.lines();

    // Lấy dòng đầu tiên để kiểm tra có phải header không
    let first_line = lines.next().ok_or("Input is empty")?;

    // Nếu chứa một trong các từ khóa phổ biến của header → bỏ qua
    let is_header = first_line.contains("TT")
        || first_line.contains("Mã lớp")
        || first_line.contains("Tên lớp")
        || first_line.contains("Số TC")
        || first_line.contains("Giảng viên");

    // Ghép lại toàn bộ phần còn lại
    let data = if is_header {
        lines.collect::<Vec<_>>().join(" ")
    } else {
        // Nếu không có header, vẫn cần dùng dòng đầu
        std::iter::once(first_line)
            .chain(lines)
            .collect::<Vec<_>>()
            .join(" ")
    };

    parse_courses(&data).await
}

fn parse_schedule_from_course(course: &Course) -> Vec<ScheduleItem> {
    println!("{course:?}");
    let re_day = Regex::new(r"(?:Thứ\s*)?(\d+):\s*(\d+)-(\d+),\s*(\w+)").unwrap();

    let re_week = Regex::new(r"(\d+)-(\d+)").unwrap();

    let mut result = vec![];
    for cap_week in re_week.captures_iter(&course.weeks) {
        let start_week = cap_week[1].parse::<u32>().unwrap();
        let end_week = cap_week[2].parse::<u32>().unwrap();

        for cap in re_day.captures_iter(&course.schedule) {
            result.push(ScheduleItem {
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
    for re in &result {
        println!("{re:?}");
    }

    result
}

fn export_to_ics(
    schedules: &[ScheduleItem],
    output_path_str: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut calendar = Calendar::new();
    let mut output_path = PathBuf::from(output_path_str);

    // Academic year starts around January 6th, 2025, with week 24 starting on this date.
    let academic_year_start_date = NaiveDate::from_ymd_opt(2025, 1, 6).unwrap();

    // Define period start times (adjust as needed)
    let period_start_times: HashMap<u32, NaiveTime> = [
        (1, NaiveTime::from_hms_opt(7, 0, 0).unwrap()),
        (2, NaiveTime::from_hms_opt(8, 00, 0).unwrap()),
        (3, NaiveTime::from_hms_opt(9, 00, 0).unwrap()),
        (4, NaiveTime::from_hms_opt(10, 00, 0).unwrap()),
        (5, NaiveTime::from_hms_opt(11, 00, 0).unwrap()),
        (6, NaiveTime::from_hms_opt(12, 30, 0).unwrap()),
        (7, NaiveTime::from_hms_opt(13, 30, 0).unwrap()),
        (8, NaiveTime::from_hms_opt(14, 30, 0).unwrap()),
        (9, NaiveTime::from_hms_opt(15, 30, 0).unwrap()),
        (10, NaiveTime::from_hms_opt(16, 30, 0).unwrap()),
        (11, NaiveTime::from_hms_opt(17, 30, 0).unwrap()),
        (12, NaiveTime::from_hms_opt(18, 30, 0).unwrap()),
    ]
    .iter()
    .cloned()
    .collect();

    // Define period end times (adjust as needed)
    let period_end_times: HashMap<u32, NaiveTime> = [
        (1, NaiveTime::from_hms_opt(7, 50, 0).unwrap()),
        (2, NaiveTime::from_hms_opt(8, 50, 0).unwrap()),
        (3, NaiveTime::from_hms_opt(9, 50, 0).unwrap()),
        (4, NaiveTime::from_hms_opt(10, 50, 0).unwrap()),
        (5, NaiveTime::from_hms_opt(11, 50, 0).unwrap()),
        (6, NaiveTime::from_hms_opt(13, 20, 0).unwrap()),
        (7, NaiveTime::from_hms_opt(13, 20, 0).unwrap()),
        (8, NaiveTime::from_hms_opt(15, 20, 0).unwrap()),
        (9, NaiveTime::from_hms_opt(16, 20, 0).unwrap()),
        (10, NaiveTime::from_hms_opt(17, 20, 0).unwrap()),
        (11, NaiveTime::from_hms_opt(18, 20, 0).unwrap()),
        (12, NaiveTime::from_hms_opt(19, 20, 0).unwrap()),
    ]
    .iter()
    .cloned()
    .collect();

    for schedule_item in schedules {
        for week_num in schedule_item.start_week..=schedule_item.end_week {
            // Calculate the date for the current week and day based on week 24 starting on 2025-01-05
            let days_offset = (week_num - 24) * 7 + (schedule_item.day - 2); // Assuming day 2 is Monday
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

pub fn generate_ics_from_courses(
    courses: &[Course],
    output_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut all_schedules = vec![];

    for course in courses {
        all_schedules.extend(parse_schedule_from_course(course));
    }

    export_to_ics(&all_schedules, output_path)?;
    Ok(())
}

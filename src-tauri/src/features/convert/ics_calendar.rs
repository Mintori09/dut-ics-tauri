use crate::models::course::{
    Course, PrintTerminal, generate_ics_from_courses, parse_courses_from_lines,
};

#[tauri::command]
pub async fn handle_schedule(contents: &str) -> Result<Vec<Course>, String> {
    match parse_courses_from_lines(contents).await {
        Ok(courses) => {
            println!("Ok");
            Ok(courses)
        }
        Err(e) => {
            eprintln!("Error parsing courses: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub async fn from_markdown_to_ics(data: String, output_path: String) -> Result<(), String> {
    match parse_courses_from_lines(&data).await {
        Ok(courses) => {
            courses.print_course();

            match generate_ics_from_courses(&courses, &output_path) {
                Ok(_) => println!("Successfully generated calendar.ics at {:?}", output_path),
                Err(e) => eprintln!("Error generating ICS: {}", e),
            }
        }
        Err(e) => eprintln!("Error parsing courses: {}", e),
    }
    Ok(())
}

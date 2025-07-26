pub fn parse_date(date: &str) -> (u32, u32, i32) {
    // Ví dụ: date = "18-07-2025"
    let parts: Vec<&str> = date.split('-').collect();
    if parts.len() != 3 {
        panic!("Invalid date format");
    }

    let day = parts[0].parse::<u32>().unwrap();
    let month = parts[1].parse::<u32>().unwrap();
    let year = parts[2].parse::<i32>().unwrap();

    (day, month, year)
}

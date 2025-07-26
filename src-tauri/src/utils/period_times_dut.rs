use std::collections::HashMap;

use chrono::NaiveTime;

/// Trả về hashmap ánh xạ tiết học -> thời gian bắt đầu
pub fn period_start_times() -> HashMap<u32, NaiveTime> {
    [
        (1, (7, 0)),
        (2, (8, 0)),
        (3, (9, 0)),
        (4, (10, 0)),
        (5, (11, 0)),
        (6, (12, 30)),
        (7, (13, 30)),
        (8, (14, 30)),
        (9, (15, 30)),
        (10, (16, 30)),
        (11, (17, 30)),
        (12, (18, 30)),
    ]
    .into_iter()
    .map(|(p, (h, m))| {
        (
            p,
            NaiveTime::from_hms_opt(h, m, 0).expect("valid start time"),
        )
    })
    .collect()
}

/// Trả về hashmap ánh xạ tiết học -> thời gian kết thúc
pub fn period_end_times() -> HashMap<u32, NaiveTime> {
    [
        (1, (7, 50)),
        (2, (8, 50)),
        (3, (9, 50)),
        (4, (10, 50)),
        (5, (11, 50)),
        (6, (13, 20)),
        (7, (13, 20)),
        (8, (15, 20)),
        (9, (16, 20)),
        (10, (17, 20)),
        (11, (18, 20)),
        (12, (19, 20)),
    ]
    .into_iter()
    .map(|(p, (h, m))| (p, NaiveTime::from_hms_opt(h, m, 0).expect("valid end time")))
    .collect()
}

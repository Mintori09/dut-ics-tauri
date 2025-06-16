import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { open } from '@tauri-apps/plugin-dialog';
import DownloadButton from "./components/DownloadButton"

type PathDir = {
    path: string,
    setPath: (path: string) => void
};

function SelectFileButton({ path, setPath }: PathDir) {
    const handleSelectDirectory = async () => {
        const file = await open({
            multiple: false,
            directory: false,
            filters: [
                {
                    name: "Markdown",
                    extensions: ['md']
                }
            ]
        });

        if (file && typeof file === "string") {
            setPath(file);
        } else {
            console.log("Dir is not selected!");
        }
    }

    return (
        <div className="select-file-button">
            <button onClick={handleSelectDirectory}>
                {path ? path : "Select Markdown File"}
            </button>
        </div>
    );
};

type Course = {
    index: number;
    course_code: string;
    course_name: string;
    credit: number;
    lecturer: string;
    schedule: string;
    weeks: string;
    registration_time: string;
    retake: boolean;
    registered: string;
    is_clc: boolean;
};
interface TableProps {
    courses: Course[];
}

function App() {
    const [schedule, setSchedule] = useState("")
    const [courses, setCourses] = useState<Course[]>([]);
    const [path, setPath] = useState<string>("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handle_course() {
        setLoading(true);
        setError(null);
        try {
            let content = (await invoke("handle_schedule", { contents: schedule })) as Course[];
            setCourses(content);
        } catch (error: any) {
            setCourses([]);
            setError(error.toString());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const readFile = async (path: string) => {
            try {
                let contents: string = await invoke("read_markdown_file", { path });
                setSchedule(contents);
            } catch (e: any) {
                console.error("read failed", e);
                setError("Failed to read file: " + e.toString());
            }
        }

        if (path) {
            readFile(path)
        }

    }, [path]);

    return (
        <main className="container">
            <div className="input-section">
                <h2>Nhập dữ liệu lịch học</h2>
                <textarea
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    rows={10}
                    placeholder="Dán dữ liệu lịch học từ file markdown vào đây..."
                />
                <div className="input-actions">
                    <SelectFileButton path={path} setPath={setPath} />
                    <button onClick={handle_course} className="btn" disabled={loading}>
                        {loading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>

            <div className="output-section">
                {loading && <p>Đang tải...</p>}
                {!loading && courses.length > 0 && <CourseTable courses={courses} />}
                {!loading && courses.length === 0 && !error && schedule && <p>Không tìm thấy môn học nào.</p>}
                {!loading && !schedule && <p>Vui lòng nhập hoặc chọn file dữ liệu lịch học.</p>}
            </div>
             {courses.length > 0 && <DownloadButton data={schedule} />}
        </main>
    );
}



function CourseTable({ courses }: TableProps) {
    return (
        <div className="course-table-container">
            <h3>Danh sách môn học</h3>
            <table className="course-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Mã môn</th>
                        <th>Tên môn</th>
                        <th>Tín chỉ</th>
                        <th>Giảng viên</th>
                        <th>Lịch</th>
                        <th>Tuần</th>
                        <th>Thời gian ĐK</th>
                        <th>Retake</th>
                        <th>Đã đăng ký</th>
                        <th>CLC</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((c) => (
                        <tr key={c.index}>
                            <td>{c.index}</td>
                            <td>{c.course_code}</td>
                            <td>{c.course_name}</td>
                            <td>{c.credit}</td>
                            <td>{c.lecturer}</td>
                            <td>{c.schedule}</td>
                            <td>{c.weeks}</td>
                            <td>{c.registration_time}</td>
                            <td>{c.retake ? "✅" : "❌"}</td>
                            <td>{c.registered}</td>
                            <td>{c.is_clc ? "✅" : "❌"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default App;

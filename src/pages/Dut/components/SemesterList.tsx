import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import { SelectType } from "../hooks/useSemesters";
import { useState } from "react";

interface Props {
    semesters: SelectType[];
    setSemesters: (semesters: SelectType[]) => void
}

export default function SemesterList({ semesters, setSemesters }: Props) {
    if (!semesters || semesters.length === 0) return null;

    const [selected, setSelected] = useState(
        semesters.find((s) => s.selected)?.value || ""
    );

    const handleChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;

        setSelected(newValue);

        const updatedSemesters = semesters.map((s) => ({
            ...s,
            selected: s.value === newValue,
        }));

        setSemesters(updatedSemesters);

        console.log("Học kỳ được chọn:", newValue);
    };

    return (
        <Box
            sx={{
                width: "fit-content",
                minWidth: 180,
                p: 1.5,
                border: "1px solid #ddd",
                backgroundColor: "#fafafa",
                mb: 2,
                borderRadius: 3,
            }}
        >

            <FormControl fullWidth size="small" className="rounded-ee-md">
                <InputLabel id="semesters-select-label">Học kỳ</InputLabel>
                <Select
                    labelId="semesters-select-label"
                    id="semesters-select"
                    label="Học kỳ"
                    value={selected}
                    onChange={handleChange}
                    sx={{
                        borderRadius: 1,
                        fontSize: "0.875rem",
                        backgroundColor: "white",
                    }}
                >
                    {semesters.map((semester) => (
                        <MenuItem
                            key={semester.value}
                            value={semester.value}
                            sx={{ fontSize: "0.85rem" }}
                        >
                            {semester.text}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

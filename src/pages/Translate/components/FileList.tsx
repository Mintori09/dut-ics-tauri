import {
    Card,
    CardHeader,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
} from "@mui/material";
import {
    CheckCircle,
    ErrorOutline,
    HourglassEmpty,
} from "@mui/icons-material";
import type { TranslateOutput } from "../types/TranslateInput";
import styles from "./FileList.module.css";

const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) return <CheckCircle sx={{ color: "green" }} />;
    if (status === false) return <ErrorOutline sx={{ color: "red" }} />;
    return <HourglassEmpty sx={{ color: "gray" }} />;
};

const getStatusText = (f: TranslateOutput) => {
    if (f.is_translated === true)
        return `✅ Đã dịch → ${f.translate_input.output_path}`;
    if (f.is_translated === false) return `❌ Lỗi khi dịch`;
    return "⏳ Chưa dịch";
};

export function FileList({ files }: { files: TranslateOutput[] }) {
    if (files.length === 0) return null;

    const sortedFiles = [...files].sort((a, b) => {
        const getStatusPriority = (val: boolean | undefined) =>
            val === true ? 0 : val === false ? 1 : 2;
        return getStatusPriority(a.is_translated) - getStatusPriority(b.is_translated);
    });

    return (
        <Card
            variant="outlined"
            className={styles.card}
        >
            <CardHeader
                title="📂 Danh sách file đã chọn"
                titleTypographyProps={{ variant: "h6" }}
                className={styles.cardHeader}
            />
            <CardContent className={styles.cardContent}>
                <List dense disablePadding>
                    {sortedFiles.map((f, idx) => (
                        <Box key={idx}>
                            <ListItem className={styles.listItem}>
                                <ListItemIcon className={styles.icon}>
                                    {getStatusIcon(f.is_translated)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" noWrap>
                                            {f.translate_input.input_path}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary">
                                            {getStatusText(f)}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {idx < sortedFiles.length - 1 && <Divider component="li" />}
                        </Box>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}



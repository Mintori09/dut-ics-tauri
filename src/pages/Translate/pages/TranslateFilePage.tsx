import {
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography,
} from "@mui/material";
import { FileList } from "../components/FileList";
import { useTranslator } from "../hooks/useTranslator";
import styles from "./TranslateFilePage.module.css";

export default function TranslateFilePage() {
    const {
        files,
        fromLang,
        toLang,
        loading,
        setFromLang,
        setToLang,
        handleSelectFiles,
        handleTranslate,
    } = useTranslator();

    return (
        <Container maxWidth="md" className={styles.container}>
            <Typography variant="h4" gutterBottom>
                📄 Batch File Translator
            </Typography>

            <Box className={styles.form}>
                <TextField
                    label="From"
                    value={fromLang}
                    onChange={(e) => setFromLang(e.target.value)}
                    size="small"
                    fullWidth
                />
                <TextField
                    label="To"
                    value={toLang}
                    onChange={(e) => setToLang(e.target.value)}
                    size="small"
                    fullWidth
                />
                <Button variant="outlined" onClick={handleSelectFiles} fullWidth>
                    📂 Chọn File
                </Button>
                <Button
                    variant="contained"
                    onClick={handleTranslate}
                    disabled={files.length === 0 || loading}
                    fullWidth
                >
                    🔄 Dịch
                </Button>
            </Box>

            <FileList files={files} />

            {loading && (
                <Box className={styles.loadingBox}>
                    <CircularProgress />
                    <Typography mt={2}>⏳ Đang dịch, vui lòng chờ...</Typography>
                </Box>
            )}
        </Container>
    );
}



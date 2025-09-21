export type Video = {
    id: string;
    file: string;
    title: string;
    watched: boolean;
    duration: number;
};

export type Section = {
    id: number;
    name: string;
    videos: Video[];
};

export type Course = {
    course: string;
    sections: Section[];
};


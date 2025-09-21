import { X, Search } from "lucide-react"; // hoặc Heroicons tuỳ bạn
import { useState } from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
    const [focused, setFocused] = useState(false);

    return (
        <div
            className={`flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm transition mb-px ${focused ? "ring-2 ring-primary border-primary" : "border-gray-300"
                }`}
        >
            {/* Icon search */}
            <Search className="w-4 h-4 text-gray-400 shrink-0" />

            {/* Input */}
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Tìm kiếm..."}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 bg-transparent outline-none text-sm"
            />

            {/* Nút clear */}
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

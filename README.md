# dut-ics-tauri

A Tauri application for creating ICS calendar files to import into various calendar applications like Google Calendar, Thunderbird, and Microsoft Outlook.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Create ICS Calendar Files**: Generate ICS files compatible with popular calendar applications.
- **Import into Popular Calendar Applications**: Easily import generated ICS files into Google Calendar, Thunderbird, Microsoft Outlook, and more.
- **Cross-Platform Support**: Works on Windows, macOS, and Linux.
- **User-Friendly Interface**: Intuitive and easy-to-use interface for creating and managing calendar events.
- **Customizable Calendar Events**: Customize event details such as title, description, start time, end time, and more.
- **Batch Processing**: Import multiple events at once.
- **Recurring Events**: Support for creating recurring events.
- **Time Zone Support**: Handle events in different time zones.

## Installation

### Prerequisites

- **Node.js**: Version 18 or later
- **Rust**: Version 1.60 or later
- **Tauri CLI**: Install using `cargo install tauri-cli`
- **pnpm**: Version 8 or later

### Steps

1. **Clone the Repository**:
   ```sh
   git clone git@github.com:Mintori09/dut-ics-tauri.git
   cd dut-ics-tauri
   ```

2. **Install Dependencies**:
   ```sh
   pnpm install
   ```

3. **Build the Application**:
   ```sh
   pnpm tauri build
   ```

4. **Run the Application**:
   ```sh
   pnpm tauri dev
   ```

## Usage

1. **Launch the Application**:
   ```sh
   pnpm tauri dev
   ```

2. **Create a New Calendar Event**:
   - Click on the "New Event" button.
   - Fill in the event details such as title, description, start time, end time, and time zone.
   - Click "Save" to add the event to your calendar.

3. **Import Events into a Calendar Application**:
   - Click on the "Export" button to generate an ICS file.
   - Open your preferred calendar application (e.g., Google Calendar, Thunderbird, Microsoft Outlook).
   - Import the generated ICS file into your calendar application.

4. **Manage Events**:
   - Edit existing events by clicking on them and selecting "Edit".
   - Delete events by clicking on them and selecting "Delete".

## Configuration

The application can be configured by modifying the `tauri.conf.json` file. See the [Tauri configuration documentation](https://tauri.app/v1/guides/configuration/) for more details.

### Example Configuration

```json
{
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all"
    },
    "windows": [
      {
        "title": "dut-ics-tauri",
        "width": 800,
        "height": 600
      }
    ]
  }
}
```

## Project Structure

- **src-tauri**: Contains the Rust backend code and Tauri configuration.
  - `Cargo.toml`: Rust package configuration.
  - `src/`: Rust source code.
    - `main.rs`: Entry point for the Tauri application.
    - `lib.rs`: Library code for the Tauri application.
- **src**: Contains the frontend code.
  - `App.tsx`: Main React component.
  - `main.tsx`: Entry point for the React application.
  - `components/`: React components.
  - `pages/`: React pages.
  - `utils/`: Utility functions.
  - `configs/`: Configuration files.
  - `hooks/`: Custom React hooks.
  - `types/`: TypeScript type definitions.
  - `routes/`: React Router configuration.
  - `redux/`: Redux store and reducers.
  - `layouts/`: Layout components.
  - `assets/`: Static assets.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any questions or support, please open an issue on the [GitHub repository](https://github.com/Mintori09/dut-ics-tauri).

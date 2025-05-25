# Remind Me All

<p align="center">
  <img src="./assets/icon.png" alt="Remind Me All Logo" width="120" height="120">
</p>

## Overview

Remind Me All is a mobile application designed to help students keep track of their class schedules. It provides timely notifications about upcoming classes, displays daily and weekly schedules, and offers a user-friendly interface for managing academic timetables.

## Features

### 📅 Class Schedule Management

- View your complete weekly class schedule
- Organized day-by-day view with a tab interface
- Carousel display of today's classes
- Automatic highlighting of current ongoing class

### 🔔 Smart Notifications

- Evening reminders for next day's classes
- Customizable notification preferences
- Background notifications that work even when the app is closed

### 👥 Group Support

- Support for different class groups/sections
- Filter schedules based on your assigned group

### 📱 User-Friendly Interface

- Clean, intuitive UI with modern design
- Swipeable carousel for quick class overview
- Color-coded class cards based on class type
- Drawer menu for easy access to settings

### 🏫 Institution Support

- Select your university, program, semester, and section
- Automatic schedule fetching based on your selection

### 📆 Holiday Recognition

- Automatic display of holidays
- No class notifications on holidays

### 🔄 Offline Support

- Cached schedules for offline access
- Automatic syncing when online

### 🔄 Auto-Updates

- In-app update notifications
- Seamless update process

## Technical Details

### Built With

- React Native / Expo
- TypeScript
- TailwindCSS for styling
- Expo Notifications for push notifications
- AsyncStorage for local data persistence

### Key Components

- **App.tsx**: Main application component managing the overall state and UI
- **Card.tsx**: Renders individual class cards with relevant information
- **picker.tsx**: Handles university/program/section selection
- **notificationService.js**: Manages all notification functionality
- **DivideGroups.ts**: Handles group-based schedule filtering

## Installation

```bash
# Install dependencies
yarn install

# Start the development server
yarn start

# Build for Android
yarn build
```

## Usage

1. On first launch, select your university, program, semester, section, and group
2. View your daily and weekly schedule
3. Enable notifications to receive reminders about upcoming classes
4. Use the drawer menu to access additional settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/the-remind-me/remind-me-v4-application](https://github.com/the-remind-me/remind-me-v4-application)

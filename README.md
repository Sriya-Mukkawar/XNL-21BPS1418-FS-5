# Video Chat Application

A real-time video chat application built with Next.js, TypeScript, and WebRTC.

## Features

- Real-time video and audio calls
- Text chat with file sharing
- User authentication
- Dark/Light mode support
- Responsive design

## Tech Stack

- Next.js 13
- TypeScript
- Tailwind CSS
- Recoil for state management
- Jest for testing
- WebRTC for video calls
- Pusher for real-time communication

## Getting Started

1. Clone the repository
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_APP_KEY=
PUSHER_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ZEGO_APP_ID=
ZEGO_SERVER_SECRET=
```

4. Run the development server
```bash
npm run dev
```

5. Run tests
```bash
npm test
```

## Testing

The project uses Jest and React Testing Library for testing. To run tests:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Database Schema

### Core Entities

### User

| Field          | Type      | Constraints      |
|---------------|----------|------------------|
| `id`         | ObjectId  | Primary Key      |
| `name`       | String    | Required         |
| `email`      | String    | Unique, Required |
| `emailVerified` | Boolean  | Default: false  |
| `hashedPassword` | String  | Required        |
| `image`      | String    | Optional         |
| `about`      | String    | Optional         |
| `lastSeen`   | DateTime  | Default: null    |

#### Relations:
- `User` ↔ `Conversation` (Many-to-Many)
- `User` ↔ `Message` (One-to-Many)
- `User` ↔ `SeenMessages` (Many-to-Many)

---

### Conversation

| Field         | Type      | Constraints      |
|--------------|----------|------------------|
| `id`        | ObjectId  | Primary Key      |
| `name`      | String    | For group chats  |
| `isGroup`   | Boolean   | Default: false   |
| `lastMessageAt` | DateTime | Default: null  |

#### Relations:
- `Conversation` ↔ `Users` (Many-to-Many)
- `Conversation` ↔ `Messages` (One-to-Many)

---

### Message

| Field        | Type      | Constraints      |
|-------------|----------|------------------|
| `id`       | ObjectId  | Primary Key      |
| `body`     | String    | Optional         |
| `image`    | String    | Optional         |
| `audio`    | String    | Optional         |
| `video`    | String    | Optional         |
| `type`     | String    | Required         |
| `metadata` | String    | Optional         |
| `createdAt` | DateTime  | Required        |

#### Relations:
- `Message` ↔ `Sender (User)` (Many-to-One)
- `Message` ↔ `Conversation` (Many-to-One)
- `Message` ↔ `SeenBy (Users)` (Many-to-Many)

## System Architecture
### Key Components

#### 1.Real-time Communication
WebSocket connections (Pusher)
Presence detection
Message queuing

#### 2.Media Handling
Audio/Video streaming
File uploads
Media compression

#### 3.Performance Optimizations
Lazy loading components
Image optimization
Database indexing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

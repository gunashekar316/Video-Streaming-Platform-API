# Video Streaming Platform API

[![Live API](https://img.shields.io/badge/Live_API-Deployed-success?style=for-the-badge&logo=render)](https://video-streaming-platform-api-bweu.onrender.com)
[![API Documentation](https://img.shields.io/badge/API_Docs-Postman-orange?style=for-the-badge&logo=postman)](https://documenter.getpostman.com/view/53529101/2sBXwyGSaY#intro)

This is a comprehensive backend API for a video hosting website, built with **Node.js, Express.js, MongoDB, and Mongoose**. It follows standard industry practices including JWT-based authentication (Access & Refresh tokens), secure password hashing (Bcrypt), and file uploads to cloud storage (Cloudinary).

> **🔗 Live Server:** [https://video-streaming-platform-api-bweu.onrender.com](https://video-streaming-platform-api-bweu.onrender.com)  
> **📚 API Documentation:** [View the full Postman Docs here](https://documenter.getpostman.com/view/53529101/2sBXwyGSaY#intro)

## Features

- **User Authentication**: Secure signup and login using JWT. Token refreshment logic is also built-in.
- **Video Management**: Upload videos, publish them, update titles/descriptions, change thumbnails, and delete videos.
- **Social Features**: 
  - Like or dislike videos, comments, and community tweets.
  - Comment on videos with full CRUD functionality.
  - Subscribe or unsubscribe from channels.
- **Playlists**: Create curated playlists, and add or remove videos from them.
- **Community**: Channels can post text-based tweets for their subscribers.
- **Analytics Dashboard**: Fetch detailed statistics for a channel, including total video views, total subscribers, and total likes across all videos.

## Tech Stack

- **Node.js & Express.js**: Server and API routing
- **MongoDB & Mongoose**: Database and ODM (Object Data Modeling)
- **JWT**: Authentication & Authorization
- **Bcrypt**: Password hashing
- **Multer**: Local file uploading middleware
- **Cloudinary**: Cloud storage for video and image files

## Setup Instructions

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   ```

2. **Environment Variables**: Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:8000`.

## API Endpoints Reference

All routes are prefixed with `/api/v1`

- **Users**: `/users/register`, `/users/login`, `/users/logout`, `/users/refresh-token`, `/users/change-password`, `/users/current-user`, `/users/c/:username`, etc.
- **Videos**: `/videos`, `/videos/:videoId`, `/videos/toggle/publish/:videoId`
- **Tweets**: `/tweets`, `/tweets/user/:userId`, `/tweets/:tweetId`
- **Subscriptions**: `/subscriptions/c/:channelId`, `/subscriptions/u/:subscriberId`
- **Playlists**: `/playlists`, `/playlists/:playlistId`, `/playlists/add/:videoId/:playlistId`, `/playlists/remove/:videoId/:playlistId`, `/playlists/user/:userId`
- **Likes**: `/likes/toggle/v/:videoId`, `/likes/toggle/c/:commentId`, `/likes/toggle/t/:tweetId`, `/likes/videos`
- **Comments**: `/comments/:videoId`, `/comments/c/:commentId`
- **Dashboard**: `/dashboard/stats`, `/dashboard/videos`

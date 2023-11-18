# Video Battle

## Description

Video Battle is an innovative, real-time, video-sharing platform where users can watch and share videos synchronously. The last video submitted by any user plays simultaneously for all visitors to the site, making it a real-time shared video experience.

[Try it out online here!](https://video-battle-7eb93638f816.herokuapp.com)

## Features

- **Real-Time Video Synchronization:** Every user on the site watches the same video at the same time, regardless of when they join.

- **User Submitted Content:** Anyone can submit a video link. Once submitted, the video is queued to play next.

- **Anonymous Submissions:** You don't need an account to submit a video. You can choose to submit videos anonymously.

## Installation

To get started with Video Battle, clone the repository and then install the dependencies:

```bash
git clone https://github.com/username/Video-Battle.git
cd Video-Battle
yarn install
```

Copy the included .env.example to .env and add the required environment variables.  
Set SESSION_SECRET to a random UUID.  
Set WEBSOCKET_URL to ws://localhost:3000 for development.  

## Deployment to Heroku

Use the Heroku wizard to start your new project.

Push the project code to your Heroku app with
```bash
heroku git:remote -a <your_heroku_app_name>
git push heroku main
```

Create a database with
```bash
heroku addons:create heroku-postgresql
```

This may be necessary for the database to connect properly
```bash
heroku config:set PGSSLMODE=no-verify
```

Instead of a .env file, set the same variables through the Config Vars interface.  
Set SESSION_SECRET to a random UUID.  
Set WEBSOCKET_URL to wss://your-app-address  

Run the database migrations with
```bash
heroku run bash
cd server
yarn run migrate:latest
```

Open the app with
```bash
heroku open
```

Monitor for problems with
```bash
heroku logs --tail
```

## Usage

To start the application:

```bash
yarn dev
```

The application will now be running at `http://localhost:3000`.

## Contributing

We welcome contributions to Video Battle! Please see our [contributing guidelines](CONTRIBUTING.md) for more details.

## License

Video Battle is [MIT licensed](LICENSE).

## Support

If you're having issues with the application, please let us know. You can submit a GitHub issue or reach out directly at [support@email.com](mailto:support@email.com).

## Acknowledgements

Thank you to all our users and contributors! Your feedback and support keep Video Battle running.

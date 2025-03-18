module.exports = {
  apps : [{
    name   : "foodie_finder",
    script : "./dist/src/app.js",
    env_production : {
      NODE_ENV: "production"
    }
  }]
}

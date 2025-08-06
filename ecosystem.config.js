module.exports = {
  apps: [
    {
      name: "main",
      cwd: "./apps/main",
      script: "npm",
      args: "run start:main",
      env: {
        PORT: 6100
      }
    },
    {
      name: "profile",
      cwd: "./apps/profile",
      script: "npm",
      args: "run start:profile",
      env: {
        PORT: 6001
      }
    },
    {
      name: "brain",
      cwd: "./apps/brain",
      script: "npm",
      args: "run start:brain",
      env: {
        PORT: 6002
      }
    },
    {
      name: "writer",
      cwd: "./apps/writer",
      script: "npm",
      args: "run start:writer",
      env: {
        PORT: 6003
      }
    },
    
  ]
};


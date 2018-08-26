module.exports= {
    db:{
        database: 'loginmodule',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
    },
    dbAddress(){
        if(process.env.DB_URI){
            return process.env.DB_URI;
        }
        else if(this.db.username && this.db.password){
            return `mongodb://${this.db.username}:${this.db.password}@${this.db.host}:${this.db.port}/${this.db.database}`
        }else{
            return `mongodb://${this.db.host}:${this.db.port}/${this.db.database}`
        }
    }
    ,
    secret: process.env.SECRET || "ssssssssssssss its secret"
    ,
    default:{
        user:{
            name: "Anonymous",
            email: "Anonymous",
            password: process.env.PASSWORD || '$2b$10$1wfNHOq1NfNjRnV0yoj5sekhDk/HkvI5Dt7QvHID/3n99E6LOA2QO'
        },
        counter:{
            name:'counter',
            value:1
        },
        specialRoutes:[
            {longUrl:"/" ,shortUrl: "/login"},
            {longUrl:"/" ,shortUrl: "/signup"},
            {longUrl:"/" ,shortUrl: "/logout"},
        ]
    }
};

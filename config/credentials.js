module.exports= {
    secret: process.env.SECRET
    ,
    default:{
        user:{
            name: "Anonymous",
            email: "Anonymous",
            password: process.env.PASSWORD
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

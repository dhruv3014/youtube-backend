// Mongoose is for elegent mongodb object modeling for node.js
import mongoose, {Schema} from "mongoose"
// if we write like this 'import mongoose from "mongoose"' then write line 7 as, 'const userSchema = new mongoose.Schema()'

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // this means the name will in the database searching and also will be expensive. Don't set every fields as index because performance will be decreased due to that
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },{timestamps: true}
)

// pre hook - Pre middleware functions are executed one after another, when each middleware calls next.
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
} // return value true or false

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    // syntax: jwt.sign( Payload , Secret_Key, ExpiresIn)
    // In this we don't have to use async method because it doesn't take long time to execute
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model("User", userSchema)
// when this(like User written above) name goes into mongodb database, it changes in to plural form and in lowercase(like users)
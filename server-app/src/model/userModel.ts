import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add the user name"],
    },
    email: {
            type: String,
            required: [true, "Please add the user email address"],
            unique: [true, "Email address already taken"],
    },
    password: {
            type: String,
            required: [true, "Please add the user password"],
            // select: false
    },
    isPremium: {
        type: Boolean,
        default:false
    },
},  {  timestamps: true });

export default mongoose.model("User", userSchema);
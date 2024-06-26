import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend
  //validation not empty
  //check if user name already exist:username email
  //check for images,check for avatar
  //upload them to cloudinary
  //create user object-create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
  const { fullName, email, username, password } = req.body;

  console.log("email", email);

  //below method can be used one by one on all the field
  //  if (fullname === ""){
  //     throw new ApiError(400,"fullname is required")
  //  }

  // to avoid above hustle we can use some method
  /* The some() method of Array instances tests whether at least one element in the array passes the test implemented by the provided function. It returns true if, in the array, it finds an element for which the provided function returns true; otherwise it returns false. It doesn't modify the array.
*/
if([fullName,email,username,password].some((field)=>field?.trim()==="")){
    throw new ApiError(400,"All field is compulsory")
}

//here user is coming from user.model.js
//only user has authority to check for database.........
const existedUser=await User.findOne({
    $or:[{ username },{ email }]
})
 if(existedUser){
    throw new ApiError(409,"user with email username already exist")
 }
//multer gives access of req.file
const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

const user = await User.create({
    fullName,
    avatar:avatar.url,
    
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()

})
const createdUser = await User.findById(user._id).select(
    "password -refreshToken"
)


if (!createdUser){
    throw new ApiError(500,"Something went wrong while registering a user")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered sucessfully")
)













})



export { registerUser };

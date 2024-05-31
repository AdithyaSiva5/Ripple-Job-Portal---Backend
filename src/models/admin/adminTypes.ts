import {Document} from "mongoose"

interface adminInterface extends DocumentEventMap{
    name: String,
    email: String,
    password : String,
    profileImg : String
}
export default adminInterface
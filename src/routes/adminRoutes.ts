import express , {Express , Request , Response} from 'express'
import { Login , getUsers , userBlock} from '../controllers/adminController'
const router = express.Router()

router.post('/login',Login)
router.get('/get-users',getUsers);
router.post('/user-block',userBlock)

export default router
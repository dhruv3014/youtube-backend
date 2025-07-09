import fs from 'fs'
import { ApiResponse } from './ApiResponse.js'

export const deleteFile = async (localFilePath) => {

    fs.unlinkSync(localFilePath)

    return new ApiResponse(200, null, "File Deleted Successfully")
}
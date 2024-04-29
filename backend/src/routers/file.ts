import { Context, Hono } from "hono";
import {writeFile, readFile, unlink} from "fs/promises"
import path from "path"

const file = new Hono()

file.get("/", (c: Context) => {
  return c.text("Hello Hono!")
})


type File = {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

file.post("/", async (c: Context) => {

    const data = await c.req.formData()
    const file: File | any = data.get("file")
    if (file.size > 100*1024*1024) {
      return c.json({
        message: "File size is too large",
      },400)
    }
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.log("fileBuffer",fileBuffer)
    const filePath = path.resolve(__dirname, '../../draw-chart', file.name);
    writeFile(filePath,fileBuffer,"utf-8")
    console.log("body",file)

    return c.json({
      message: "File received",
    })

})

file.get("/:file", async (c: Context) => {
  try{
    const { file } = c.req.param()
    console.log("file",file)
    const filePath = path.resolve(__dirname, '../../draw-chart',file);
  }catch(error:any){
    console.log("error",error)
    return c.json({
      message: error.message,
    },404)
  }
})

file.delete("/:file", async (c: Context) => {
  try{
    const { file } = c.req.param()
    console.log("file",file)
    const filePath = path.resolve(__dirname, '../../draw-chart',file);
    console.log("filePath",filePath)

    await unlink(filePath)
    return c.json({
      message: "File deleted",
    })
  }catch(error:any){
    console.log("error",error)
    return c.json({
      message: error.message,
    },404)
  }

})

export default file;
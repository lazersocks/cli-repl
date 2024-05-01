import { Context, Hono } from "hono";
import { writeFile, unlink } from "fs/promises";
import { createReadStream, fstat } from "fs";
import csvParser from "csv-parser";
import path from "path";

const file = new Hono();

file.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

type File = {
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

file.post("/", async (c: Context) => {
  const data = await c.req.formData();
  const file: File | any = data.get("file");
  if (file.size > 100 * 1024 * 1024) {
    return c.json(
      {
        message: "File size is too large",
      },
      400
    );
  }
  let arrayBuffer = await file.arrayBuffer();
  console.log("arrayBuffer", arrayBuffer);

  if (
    arrayBuffer[0] === 0xef &&
    arrayBuffer[1] === 0xbb &&
    arrayBuffer[2] === 0xbf
  ) {
    arrayBuffer = arrayBuffer.slice(3);
  }
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  // Check for BOM (Byte Order Mark) and remove it if present

  console.log("fileBuffer", fileBuffer, "");
  const filePath = path.resolve(__dirname, "../../draw-chart", file.name);
  await writeFile(filePath, fileBuffer, "utf-8");

  return c.json({
    message: "File received",
  });
});

type ColumnData = {
  [key: string]: string;
};
// {
//   mapHeaders: ({ header }) => {
//    if  (header.includes(column_1)){
//      return column_1
//    }else if (header.includes(column_2)){
//      return column_2
//    }else{
//      return header
//    }
//   }
// draw "Solana Historical Data.csv" "Price" "Date"

file.get("/:file", async (c: Context) => {
  try {
    const { file } = c.req.param();
    const params = c.req.query();
    const { column_1, column_2 } = params as {
      column_1: string;
      column_2: string;
    };
    const filePath = path.resolve(__dirname, "../../draw-chart", file);
    console.log("filePath", filePath);
    console.log("colums: ", column_1, column_2);
    const columns: ColumnData[] = [];

    const return_columns = await new Promise((resolve, reject) => {
      const stream = createReadStream(filePath)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => {
              console.log("header", header);
              if (header.startsWith("\uFEFF")) { //dealing with BOM caused by utf-8 encoding
                header = header.slice(1);
                if (header.startsWith('"') && header.endsWith('"')) {
                  header = header.slice(1, -1);
                }
              }
              return header;
            },
          })
        )
        .on("data", (data: any) => {
          // console.log("data",typeof data)

          // console.log("data",data, data.hasOwnProperty(column_1), data.hasOwnProperty(column_2))
          if (data.hasOwnProperty(column_1) && data.hasOwnProperty(column_2)) {
            const y_axis = parseFloat(data[column_2]) ? parseFloat(data[column_2]) : data[column_2] //should be a value
            console.log("y_axis", y_axis);
            columns.push({
              [column_1]: data[column_1],
              [column_2]: y_axis,
            });
          } else {
            stream.destroy(new Error("Column not found"));
          }
        })
        .on("end", () => {
          console.log("end");
          resolve(columns);
        })
        .on("error", (error: any) => {
          console.log("error", error);
          reject(error);
        });
    });

    return c.json({
      message: "Columns parsed",
      columns: return_columns,
    });
  } catch (error: any) {
    console.log("error", error);
    return c.json(
      {
        message: error.message,
      },
      404
    );
  }
});

file.delete("/:file", async (c: Context) => {
  try {
    const { file } = c.req.param();
    console.log("file", file);
    const filePath = path.resolve(__dirname, "../../draw-chart", file);
    console.log("filePath", filePath);

    await unlink(filePath);
    return c.json({
      message: "File deleted",
    });
  } catch (error: any) {
    console.log("error", error);
    return c.json(
      {
        message: error.message,
      },
      404
    );
  }
});

export default file;

import { Context, Hono } from "hono";
import { writeFile, unlink } from "fs/promises";
import { createReadStream, existsSync } from "fs";
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

  // if (
  //   arrayBuffer[0] === 0xef &&
  //   arrayBuffer[1] === 0xbb &&
  //   arrayBuffer[2] === 0xbf
  // ) {
  //   arrayBuffer = arrayBuffer.slice(3);
  // }
  const fileBuffer = Buffer.from(arrayBuffer);
  const filePath = path.resolve(__dirname, "../../draw-chart", file.name);
  await writeFile(filePath, fileBuffer, "utf-8");

  return c.json({
    message: "File received",
  });
});

type ColumnData = {
  [key: string]: string;
};
// draw "Solana Historical Data.csv" "Date" "Price"
//draw endpoint
file.post("/:file", async (c: Context) => {
  try {
    let { file } = c.req.param();
    const params = await c.req.json();
    const { column_1, column_2 } = params as {
      column_1: string;
      column_2: string;
    };
    //if file doesnt have .csv extension add it
    if (!file.endsWith(".csv")) {
      file = file + ".csv";
    }
    console.log("file", file);
    const filePath = path.resolve(__dirname, "../../draw-chart", file);
    if (!existsSync(filePath)) {
      return c.json(
        {
          message: "File does not exist.",
        },
        404
      );
    }
    const columns: ColumnData[] = [];

    const return_columns = await new Promise((resolve, reject) => {
      const stream = createReadStream(filePath)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => {
              
              if (header.startsWith("\uFEFF")) {
                //dealing with BOM caused by utf-8 encoding
                header = header.slice(1);
                if (header.startsWith('"') && header.endsWith('"')) {
                  header = header.slice(1, -1);
                }
              }
              console.log("header", header);
              return header;
            },
          })
        )
        .on("data", (data: any) => {
          // console.log("data",typeof data)

          //  console.log("data",data, data.hasOwnProperty(column_1), data.hasOwnProperty(column_2))
          if (data.hasOwnProperty(column_1) && data.hasOwnProperty(column_2)) {
            const y_axis = parseFloat(data[column_2])
              ? parseFloat(data[column_2])
              : data[column_2]; //should be a value to allow the chart to scale
            columns.push({
              [column_1]: data[column_1],
              [column_2]: y_axis,
            });
          } else {
            stream.destroy(new Error("Column not found."));
          }
        })
        .on("end", () => {
          resolve(columns);
        })
        .on("error", (error: any) => {
          console.log("error", error);
          reject(error);
        });
    });

    return c.json({
      message: "Columns parsed.",
      columns: return_columns,
    });
  } catch (error: any) {
    console.log("in catch error", error);
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
    let { file } = c.req.param();
    if (!file.endsWith(".csv")) {
      file = file + ".csv";
    }
    const filePath = path.resolve(__dirname, "../../draw-chart", file);
    if (!existsSync(filePath)) {
      return c.json(
        {
          message: "File does not exist.",
        },
        404
      );
    }

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

import axios, { AxiosInstance } from "axios";
import del from "del";
import { setupCache } from "../src/index";

describe("responseType null", () => {
    const io = axios.create({
        adapter: setupCache({
            // enable: false
        }),
    })
    beforeAll(async () => {
        await del(['.cache'])
    })

    test('utf', async () => {
        await request(io, 'http://localhost:8001/utf.html')
    })
    test('euc', async () => {
        await request(io, 'http://localhost:8001/euc.html')
    })
    test('Shift-JIS', async () => {
        await request(io, 'http://localhost:8001/shiftjis.html')
    })
})

describe('responseType arraybuffer', () => {
    test('arraybuffer', async () => {
        const arrayBufferIo = axios.create({
            adapter: setupCache({
            }),
            responseType: "arraybuffer"
        })
        await request(arrayBufferIo, 'http://localhost:8001/utf.html');
    })

    test('image', async () => {
        const arrayBufferIo = axios.create({
            adapter: setupCache({
            }),
            responseType: "arraybuffer"
        })
        await request(arrayBufferIo, 'http://localhost:8001/logo.png');
    })

})

describe('hoge', () =>{
  it ('should be check maxage', async () => {
    console.log('age');

    const io = axios.create({
      adapter: setupCache({
        maxAge: 61000,
      })
    });

    const response = await io.get('http://localhost:8001/logo.png');
    console.log(response.headers);

    expect(response).not.toBeNull();
  })
})
async function request(io: AxiosInstance, url: string) {
    const noncached = await io.get<string>(url);
    expect(noncached.status).toBe(200);
    const cached = await io.get<string>(url);
    expect(cached.status).toBe(200);
    expect(noncached.data).toStrictEqual(cached.data);
}


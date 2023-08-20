import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api";

let page = 1;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	try {
		const characters = await axios.get(
			`${API_URL}/character/?page=${page}`
		);
		const page1 = await axios.get(`${API_URL}/episode`);
		const page2 = await axios.get(`${API_URL}/episode/?page=2`);
		const page3 = await axios.get(`${API_URL}/episode/?page=3`);
		res.render("index.ejs", {
			characters: characters.data.results,
			episodes: [
				...page1.data.results,
				...page2.data.results,
				...page3.data.results,
			],
			count: characters.data.info.pages,
			page,
		});
	} catch (err) {
		res.status(404).send(err.message);
	}
});

app.get("/search", (req, res) => {
	res.render("search.ejs");
});

app.post("/pages", (req, res) => {
	if (req.body.type == "next") {
		page += 1;
	} else {
		page -= 1;
	}
	res.redirect("/");
});

app.listen(port, () => {
	console.log("Listening on port " + port);
});

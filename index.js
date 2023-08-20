import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api";

let page = 1;
let name = "";
let status = "";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	try {
		const characters = await axios.get(
			`${API_URL}/character/?page=${page}&name=${name}&status=${status}`
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
		name = "";
		status = "";
		page = 1;
		res.render("index.ejs", {
			error: "There is not characters that match with your search",
		});
	}
});

app.get("/search", (req, res) => {
	res.render("search.ejs");
});

app.post("/search", (req, res) => {
	page = 1;
	name = req.body.name.toLowerCase();
	if (req.body.status !== "no") {
		status = req.body.status;
	}
	res.redirect("/");
});

app.post("/pages", (req, res) => {
	if (req.body.type == "next") {
		page += 1;
	} else if (req.body.type == "previous") {
		page -= 1;
	} else {
		page = parseInt(req.body.page);
	}
	res.redirect("/");
});

app.listen(port, () => {
	console.log("Listening on port " + port);
});

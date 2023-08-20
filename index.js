import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api";

let page = 1;
let name = "";
let status = "";

let lastPath = "/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
	try {
		if (lastPath != req.path) {
			page = 1;
			name = "";
			status = "";
		}
		lastPath = req.path;
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
			error: "There is no characters that match with your search",
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
	res.redirect(lastPath);
});

app.get("/location/:id", async (req, res) => {
	try {
		if (lastPath != req.path) {
			page = 1;
		}
		lastPath = req.path;
		const result = await axios.get(`${API_URL}/location/${req.params.id}`);
		let count = result.data.residents.length % 20;
		if (0 < count && count < 10) {
			count = Math.floor(result.data.residents.length / 20) + 1;
		} else {
			count = Math.floor(result.data.residents.length / 20);
		}
		let characters = [];
		let limit = result.data.residents.length;
		if (count >= 1 && page < count) {
			limit = page * 20;
		}
		for (let i = (page - 1) * 20; i < limit; i++) {
			characters.push(result.data.residents[i].match(/\d+/));
		}
		characters = characters.join(",");
		const charactersRes = await axios.get(
			`${API_URL}/character/${characters}`
		);
		let array = charactersRes.data;
		if (page == count && result.data.residents.length % 20 == 1) {
			array = [charactersRes.data];
		}
		const page1 = await axios.get(`${API_URL}/episode`);
		const page2 = await axios.get(`${API_URL}/episode/?page=2`);
		const page3 = await axios.get(`${API_URL}/episode/?page=3`);
		res.render("location.ejs", {
			name: result.data.name,
			type: result.data.type,
			dimension: result.data.dimension,
			characters: array,
			episodes: [
				...page1.data.results,
				...page2.data.results,
				...page3.data.results,
			],
			count,
			page,
		});
	} catch (err) {
		name = "";
		status = "";
		page = 1;
		res.render("index.ejs", {
			error: "There is no location that match with your search",
		});
	}
});

app.get("/episode/:id", async (req, res) => {
	try {
		if (lastPath != req.path) {
			page = 1;
		}
		lastPath = req.path;
		const result = await axios.get(`${API_URL}/episode/${req.params.id}`);
		let count = result.data.characters.length % 20;
		if (0 < count && count < 10) {
			console.log(count);
			count = Math.floor(result.data.characters.length / 20) + 1;
		} else {
			count = Math.floor(result.data.characters.length / 20);
		}
		let characters = [];
		let limit = result.data.characters.length;
		if (count >= 1 && page < count) {
			limit = page * 20;
		}
		for (let i = (page - 1) * 20; i < limit; i++) {
			characters.push(result.data.characters[i].match(/\d+/));
		}
		characters = characters.join(",");
		const charactersRes = await axios.get(
			`${API_URL}/character/${characters}`
		);
		let array = charactersRes.data;
		if (page == count && result.data.characters.length % 20 == 1) {
			array = [charactersRes.data];
		}
		const page1 = await axios.get(`${API_URL}/episode`);
		const page2 = await axios.get(`${API_URL}/episode/?page=2`);
		const page3 = await axios.get(`${API_URL}/episode/?page=3`);
		res.render("episode.ejs", {
			name: result.data.name,
			air_date: result.data.air_date,
			episode: result.data.episode,
			episodes: [
				...page1.data.results,
				...page2.data.results,
				...page3.data.results,
			],
			characters: array,
			count,
			page,
		});
	} catch (err) {
		name = "";
		status = "";
		page = 1;
		res.render("index.ejs", {
			error: "There is no episode that match with your search",
		});
	}
});

app.get("/character/:id", async (req, res) => {
	try {
		if (lastPath != req.path) {
			page = 1;
		}
		lastPath = req.path;
		const result = await axios.get(`${API_URL}/character/${req.params.id}`);
		let episodes = "";
		result.data.episode.forEach((episode) => {
			episodes += episode.match(/\d+/) + ",";
		});
		const episodesRes = await axios.get(`${API_URL}/episode/${episodes}`);
		res.render("character.ejs", {
			name: result.data.name,
			status: result.data.status,
			species: result.data.species,
			location: result.data.location,
			numEpisodes: result.data.episode.length,
			image: result.data.image,
			episodes: episodesRes.data,
		});
	} catch (err) {
		name = "";
		status = "";
		page = 1;
		res.render("index.ejs", {
			error: "There is no character that match with your search",
		});
	}
});

app.listen(port, () => {
	console.log("Listening on port " + port);
});

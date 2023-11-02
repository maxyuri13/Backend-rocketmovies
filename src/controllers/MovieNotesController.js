const knex = require("../database/knex");
const AppError = require("../utils/AppError")

class MovieNotesController {
  async create(request, response) {
    const { title, description, rating, movieTags } = request.body;
    const user_id = request.user.id;
    const ratingCheck = parseInt(rating, 10);

    if (isNaN(ratingCheck) || ratingCheck < 1 || ratingCheck > 5) {
      throw new AppError("O rating deve ser um número inteiro entre 1 e 5!");
    }

    const [note_id] = await knex("movieNotes").insert({
      title,
      description,
      rating: ratingCheck,
      user_id
    });
    
    const movieTagsInsert = movieTags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    });

    await knex("movieTags").insert(movieTagsInsert);
    return response.json();
  }
  async show(request, response) {
    const { id } = request.params;
    const movieNote = await knex("movieNotes").where({ id }).first();
    const movieTags = await knex("movieTags").where({ note_id: id }).orderBy("name")

    return response.json({
      ...movieNote,
      movieTags
    });
  }
  async delete(request, response) {
    const { id } = request.params;
    await knex("movieNotes").where({ id }).delete();

    return response.json();
  }
  async index(request, response) {
    const { title, movieTags } = request.query;
    const user_id = request.user.id;
    let movieNotes;

    if(movieTags) {
      const filterTags = movieTags.split(',').map(tag => tag.trim());
      movieNotes = await knex("movieTags")
        .select([
          "movieNotes.id",
          "movieNotes.title",
          "movieNotes.user_id",
        ])
        .where("movieNotes.user_id", user_id)
        .whereLike("movieNotes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movieNotes", "movieNotes.id", "movieTags.note_id")
        .groupBy("movieNotes.id")
        .orderBy("movieNotes.title")

    } else {
      movieNotes = await knex("movieNotes")
      .where({ user_id })
      .whereLike("title", `%${title}%`)
      .orderBy("title");
    }

    const userTags = await knex("movieTags").where({ user_id });
    const movieNotesWithTags = movieNotes.map(note => {
      const movieNoteTags = userTags.filter(tag => tag.note_id === note.id);

      return {
        ...note,
        movieTags: movieNoteTags
      }
    });

    return response.json(movieNotesWithTags);
  }
}

module.exports = MovieNotesController;
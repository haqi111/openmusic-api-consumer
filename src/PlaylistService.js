const { Pool } = require('pg');
const { mapDBToModelSongs } = require('./utils');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylist(playlistId) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
        LEFT JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);
    const playlists = resultPlaylist.rows[0];

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
        JOIN playlist_songs ON songs.id = playlist_songs.song_id 
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const resultSongs = await this._pool.query(querySongs);
    const songs = resultSongs.rows.map(mapDBToModelSongs);

    return {
      playlist: {
        id: playlists.id,
        name: playlists.name,
        songs: songs,
      },
    };
  }
}

module.exports = PlaylistsService;

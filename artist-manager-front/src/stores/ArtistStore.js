import axios from 'axios';
import {EventEmitter} from 'fbemitter';

const SERVER = 'https://tehnologii-web-2018-mirceap1.c9users.io';

class ArtistsStore{
    constructor(){
        this.emitter = new EventEmitter();
        this.content = [];
    }
    
    async getAll(){
        try {
            let artists = await axios(`${SERVER}/artists`);
            this.content = artists.data;
            this.emitter.emit('ARTIST_LOAD');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('ARTIST_ERROR');
        }
    }
    
    async addOne(artist){
        try {
            await axios.post(`${SERVER}/artists`, artist);
            this.emitter.emit('ARTIST_ADD');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('ADD_ERROR');
        }
    }
    
    async saveOne(id, artist){
        try {
            await axios.put(`${SERVER}/artists/${id}`, artist);
            this.emitter.emit('ARTIST_SAVE');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('SAVE_ERROR');
        }
    }
    
    async deleteOne(id){
        try {
            await axios.delete(`${SERVER}/artists/${id}`);
            this.emitter.emit('ARTIST_DELETE');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('DELETE_ERROR');
        }
    }

    getEmitter(){
        return this.emitter;
    }
}

export default ArtistsStore;
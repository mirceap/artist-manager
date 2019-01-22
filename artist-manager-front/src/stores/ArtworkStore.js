import axios from 'axios';
import {EventEmitter} from 'fbemitter';

const SERVER = 'https://tehnologii-web-2018-mirceap1.c9users.io';

class ArtworksStore{
    constructor(){
        this.emitter = new EventEmitter();
        this.content = [];
    }
    
    async getAll(){
        try {
            let artworks = await axios(`${SERVER}/artworks`);
            this.content = artworks.data;
            this.emitter.emit('ARTWORK_LOAD');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('ARTWORK_ERROR');
        }
    }
    
    async addOne(artwork){
        try {
            await axios.post(`${SERVER}/artworks`, artwork);
            this.emitter.emit('ARTWORK_LOAD');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('ADD_ERROR');
        }
    }
    
    async saveOne(id, artwork){
        try {
            await axios.put(`${SERVER}/artworks/${id}`, artwork);
            this.emitter.emit('ARTWORK_SAVE');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('SAVE_ERROR');
        }
    }
    
    async deleteOne(id){
        try {
            await axios.delete(`${SERVER}/artworks/${id}`);
            this.emitter.emit('ARTWORK_DELETE');
        } catch (e) {
            console.warn(e);
            this.emitter.emit('DELETE_ERROR');
        }
    }

    getEmitter(){
        return this.emitter;
    }
}

export default ArtworksStore;
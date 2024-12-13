let currentAudio = null;
let musicas = [];
let artistas = [];
let albuns = [];

const API_URL = 'http://localhost:3000/api';

function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(`${sectionName}-section`).style.display = 'block';
    event.currentTarget.classList.add('active');

    switch(sectionName) {
        case 'musicas':
            carregarMusicas();
            break;
        case 'artistas':
            carregarArtistas();
            break;
        case 'albuns':
            carregarAlbuns();
            break;
    }
}

async function carregarMusicas(termoBusca = '') {
    try {
        const url = termoBusca 
            ? `${API_URL}/musicas?q=${encodeURIComponent(termoBusca)}`
            : `${API_URL}/musicas`;
            
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar músicas');
        musicas = await response.json();
        renderMusicas(musicas);
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
    }
}

async function carregarArtistas() {
    try {
        const response = await fetch(`${API_URL}/artistas`);
        if (!response.ok) throw new Error('Erro ao carregar artistas');
        artistas = await response.json();
        renderArtistas();
        updateArtistasSelect();
    } catch (error) {
        console.error('Erro ao carregar artistas:', error);
    }
}

async function carregarAlbuns() {
    try {
        const response = await fetch(`${API_URL}/albuns`);
        if (!response.ok) throw new Error('Erro ao carregar álbuns');
        albuns = await response.json();
        renderAlbuns();
        updateAlbunsSelect();
    } catch (error) {
        console.error('Erro ao carregar álbuns:', error);
    }
}

function updatePlayer(audioUrl, musicaInfo) {
    const player = document.getElementById('audioPlayer');
    const nowPlaying = document.querySelector('.now-playing');
    
    if (currentAudio) currentAudio.pause();
    
    player.src = audioUrl;
    currentAudio = player;
    nowPlaying.textContent = musicaInfo;
    player.play();
}

document.getElementById('arquivo')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    const previewContainer = document.querySelector('.audio-preview');
    
    if (file) {
        const url = URL.createObjectURL(file);
        preview.src = url;
        previewContainer.style.display = 'block';
    }
});

function setupSearch(inputId, array, renderFunction) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', async function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        if (inputId === 'busca-musica') {
            await carregarMusicas(searchTerm);
        } else {
            const filteredItems = array.filter(item => 
                item.nome?.toLowerCase().includes(searchTerm) ||
                item.titulo?.toLowerCase().includes(searchTerm) ||
                item.artista_nome?.toLowerCase().includes(searchTerm)
            );
            renderFunction(filteredItems);
        }
    });
}

document.getElementById('musicaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('titulo', document.getElementById('titulo').value);
    formData.append('artista_id', document.getElementById('artista').value);
    formData.append('album_id', document.getElementById('album').value);
    formData.append('data_lancamento', document.getElementById('data_lancamento').value);
    formData.append('arquivo', document.getElementById('arquivo').files[0]);
    
    try {
        const response = await fetch(`${API_URL}/musicas`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const musica = await response.json();
            musicas.push(musica);
            renderMusicas();
            this.reset();
            document.querySelector('.audio-preview').style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao cadastrar música:', error);
    }
});

function renderMusicas(lista = musicas) {
    const container = document.getElementById('resultados-musicas');
    if (!container) return;
    
    container.innerHTML = lista.map(musica => `
        <div class="music-card" data-music-id="${musica.id}">
            <div class="music-info">
                <h3><i class="fas fa-music"></i> ${musica.titulo}</h3>
                <p><i class="fas fa-microphone"></i> ${musica.artista_nome || 'Artista desconhecido'}</p>
                <p><i class="fas fa-compact-disc"></i> ${musica.album_nome || 'Álbum desconhecido'}</p>
                <p><i class="fas fa-calendar-alt"></i> ${new Date(musica.data_lancamento).toLocaleDateString()}</p>
            </div>
            <div class="music-controls">
                <button onclick="playMusic('${musica.id}')" title="Reproduzir">
                    <i class="fas fa-play"></i> Reproduzir
                </button>
                <button onclick="deleteMusic('${musica.id}')" title="Excluir">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

document.getElementById('artistaForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const artista = {
        nome: document.getElementById('nome-artista').value
    };
    
    try {
        const response = await fetch(`${API_URL}/artistas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(artista)
        });
        
        if (response.ok) {
            const novoArtista = await response.json();
            artistas.push(novoArtista);
            renderArtistas();
            updateArtistasSelect();
            this.reset();
        }
    } catch (error) {
        console.error('Erro ao cadastrar artista:', error);
    }
});

function renderArtistas(lista = artistas) {
    const container = document.getElementById('resultados-artistas');
    if (!container) return;
    
    container.innerHTML = lista.map(artista => `
        <div class="artist-card" data-artist-id="${artista.id}">
            <div class="artist-info">
                <h3><i class="fas fa-star"></i> ${artista.nome}</h3>
                <p><i class="fas fa-clock"></i> Cadastrado em: ${new Date(artista.data_criacao).toLocaleDateString()}</p>
            </div>
            <div class="artist-controls">
                <button onclick="deleteArtist('${artista.id}')" title="Excluir artista">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

document.getElementById('albumForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const album = {
        nome: document.getElementById('nome-album').value,
        artista_id: document.getElementById('artista-album').value,
        data_lancamento: document.getElementById('data-lancamento-album').value
    };
    
    try {
        const response = await fetch(`${API_URL}/albuns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(album)
        });
        
        if (response.ok) {
            const novoAlbum = await response.json();
            albuns.push(novoAlbum);
            renderAlbuns();
            updateAlbunsSelect();
            this.reset();
        }
    } catch (error) {
        console.error('Erro ao cadastrar álbum:', error);
    }
});

function renderAlbuns(lista = albuns) {
    const container = document.getElementById('resultados-albuns');
    if (!container) return;
    
    container.innerHTML = lista.map(album => `
        <div class="album-card" data-album-id="${album.id}">
            <div class="album-info">
                <h3><i class="fas fa-compact-disc"></i> ${album.nome}</h3>
                <p><i class="fas fa-microphone"></i> ${album.artista_nome || 'Artista desconhecido'}</p>
                <p><i class="fas fa-calendar-alt"></i> ${new Date(album.data_lancamento).toLocaleDateString()}</p>
            </div>
            <div class="album-controls">
                <button onclick="deleteAlbum('${album.id}')" title="Excluir álbum">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function updateArtistasSelect() {
    const selects = document.querySelectorAll('select#artista, select#artista-album');
    const options = artistas.map(artista => 
        `<option value="${artista.id}">${artista.nome}</option>`
    ).join('');
    
    selects.forEach(select => {
        if (select) {
            const defaultOption = '<option value="">Selecione o artista</option>';
            select.innerHTML = defaultOption + options;
        }
    });
}

function updateAlbunsSelect() {
    const select = document.getElementById('album');
    if (select) {
        const defaultOption = '<option value="">Selecione o álbum</option>';
        const options = albuns.map(album => 
            `<option value="${album.id}">${album.nome}</option>`
        ).join('');
        select.innerHTML = defaultOption + options;
    }
}

async function deleteMusic(id) {
    try {
        const musicCard = document.querySelector(`[data-music-id="${id}"]`);
        if (musicCard) {
            musicCard.style.animation = 'fadeOut 0.3s ease-out forwards';
            await new Promise(resolve => setTimeout(resolve, 300));
            musicCard.remove();
        }

        const response = await fetch(`${API_URL}/musicas/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            musicas = musicas.filter(m => m.id !== id);
        } else {
            await carregarMusicas();
            renderArtistas();
            updateArtistasSelect();
        }
    } catch (error) {
        console.error('Erro ao excluir música:', error);
        await carregarMusicas();
    }
}

async function deleteArtist(id) {
    try {
        const artistCard = document.querySelector(`[data-artist-id="${id}"]`);
        if (artistCard) {
            artistCard.style.animation = 'fadeOut 0.3s ease-out forwards';
            await new Promise(resolve => setTimeout(resolve, 300));
            artistCard.remove();
        }

        const response = await fetch(`${API_URL}/artistas/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            artistas = artistas.filter(a => a.id !== parseInt(id));
            updateArtistasSelect();
            await Promise.all([
                carregarMusicas(),
                carregarAlbuns()
            ]);
        } else {
            await Promise.all([
                carregarArtistas(),
                carregarMusicas(),
                carregarAlbuns()
            ]);
        }
    } catch (error) {
        console.error('Erro ao excluir artista:', error);
        await Promise.all([
            carregarArtistas(),
            carregarMusicas(),
            carregarAlbuns()
        ]);
    }
}

async function deleteAlbum(id) {
    try {
        const albumCard = document.querySelector(`[data-album-id="${id}"]`);
        if (albumCard) {
            albumCard.style.animation = 'fadeOut 0.3s ease-out forwards';
            await new Promise(resolve => setTimeout(resolve, 300));
            albumCard.remove();
        }

        const response = await fetch(`${API_URL}/albuns/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            albuns = albuns.filter(a => a.id !== parseInt(id));
            updateAlbunsSelect();
            await carregarMusicas();
        } else {
            await Promise.all([
                carregarAlbuns(),
                carregarMusicas()
            ]);
        }
    } catch (error) {
        console.error('Erro ao excluir álbum:', error);
        await Promise.all([
            carregarAlbuns(),
            carregarMusicas()
        ]);
    }
}

function playMusic(id) {
    const musica = musicas.find(m => m.id === parseInt(id));
    if (musica && musica.arquivo_url) {
        updatePlayer(musica.arquivo_url, `${musica.titulo} - ${musica.artista_nome}`);
    }
}

setupSearch('busca-musica', musicas, renderMusicas);
setupSearch('busca-artista', artistas, renderArtistas);
setupSearch('busca-album', albuns, renderAlbuns);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            carregarArtistas(),
            carregarAlbuns(),
            carregarMusicas()
        ]);

        showSection('musicas');
        
        const player = document.getElementById('audioPlayer');
        const progressBar = document.querySelector('.progress');
        
        player?.addEventListener('timeupdate', () => {
            const progress = (player.currentTime / player.duration) * 100;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        });
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});

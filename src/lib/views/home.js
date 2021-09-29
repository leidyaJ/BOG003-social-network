import {
  closeSession, createpost, getPost, DeletePosts, removeLikes, updateLikes, getPosts, updatepost,
} from '../index.js';

export const home = () => {
  const divHome = document.createElement('div');
  const templateHome = `
    <header id="container">
      <div class="nav">
        <h1>Luminar</h1>
        <button id="boton-close" type="button">Cerrar sesión</button>
      </div>      
    </header>
    <div id="text-name"></div>
    <div id="publicaciones">
      <textarea rows="5" cols="10" id="publicar" placeholder="¿Qué quieres compartir?" required >
      </textarea>
      <img  id="boton-publicar" src="./lib/views/img/publicar1.png" alt="">
    </div> 
    <div id="container-posts"></div>
   </div>
   <div id="publication-container"></div>
   <div class='modal-container'></div>
   <div class='modal-container-edit'></div>
    <footer>@Luminar 2021</footer>
  `;
  divHome.innerHTML = templateHome;

  const user = firebase.auth().currentUser;
  let currentPostId = '';
  const close = divHome.querySelector('#boton-close');
  close.addEventListener('click', () => {
    closeSession().then(() => {
      window.location.hash = '#/login';
    });
  });

  const textName = divHome.querySelector('#text-name');
  textName.innerHTML = `Bienvenida ${user.displayName}`;

  const inputPost = divHome.querySelector('#boton-publicar');
  const id = firebase.auth().currentUser.uid;
  inputPost.addEventListener('click', async () => {
    const textcontent = document.getElementById('publicar').value;

    const nameUs = firebase.auth().currentUser.displayName;

    // publicar comentrio con contenido
    if (textcontent === '' || textcontent === ' ') {
      divHome.querySelector('#publicar').value = '';
      console.log('hola escribe algo');
    } else {
      await createpost(textcontent, id, nameUs);
      getPost();
      divHome.querySelector('#publicar').value = '';
      console.log('todo esta ok');
    }
  });

  // obterner los post en tiempo real
  getPost().onSnapshot((response) => {
    const containerPosts = divHome.querySelector('#publicar');
    containerPosts.innerHTML = '';
    const divPosts = divHome.querySelector('#container-posts');
    divPosts.innerHTML = '';
    response.forEach((doc) => {
      const conta = doc.data();
      conta.id = doc.id;
      divPosts.innerHTML += ` 
      <div class='card-posts'>
      <h4>${doc.data().userName}</h4>
      <p id='postDescription'>${doc.data().content}</p>
      <p>${transformDate(doc.data().createdAt.toDate())}</p>
      <div id = "icon-content">    
        ${id === doc.data().userId ? `
        <img data-id="${conta.id}" id="edit" class="edit-btn" src="./lib/views/img/editar.png" alt="">
        <img data-id="${conta.id}" id="delete" class="delete-btn" src="./lib/views/img/eliminar.png" alt=""> ` : ''}     
        <img data-id="${conta.id}" id="like" class="like-btn" src="./lib/views/img/like.png" alt="">
        <div id=num-likes class="-likes-count"> ${doc.data().likes.length}</div>   
      </div>
      </div>
      `;
      const btnlike = divHome.querySelectorAll('.like-btn');
      btnlike.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const comePost = await getPosts(e.target.dataset.id);
          const like = comePost.data().likes;
          if (like.includes(id)) {
            removeLikes(id, e.target.dataset.id);
          } else {
            updateLikes(id, e.target.dataset.id);
          }
        });
      });

      const containerDeleteModal = document.querySelector('.modal-container');
      containerDeleteModal.innerHTML = `
          <div class='modal modal-close'>
          <p class='close'>X</p>
          <div class='modal-texto'>
          <h3>¿Estas seguro de eliminar está publicación?</h3>
          <button data-id="${conta.id}" id="delete-yes" class="btn-close-yes" src="./lib/views/img/eliminar.png" alt="" >Yes</button>
          <button id="boton-close-not" class="btn-close-not" type="button">No</button>
          </div>
          </div>
          `;
      const modal = document.querySelectorAll('.modal')[0];
      const modalCont = document.querySelectorAll('.modal-container')[0];

      const abrirModal = document.querySelectorAll('.delete-btn');
      abrirModal.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          modalCont.style.opacity = '1';
          modalCont.style.visibility = 'visible';
          modal.classList.toggle('modal-close');
          currentPostId = e.target.dataset.id;
        });
      });

      const btnDelete = divHome.querySelectorAll('.btn-close-yes');
      btnDelete.forEach((btn) => {
        btn.addEventListener('click', async () => {
          await DeletePosts(currentPostId);
          modal.classList.toggle('modal-close');

          setTimeout(() => {
            modalCont.style.opacity = '0';
            modalCont.style.visibility = 'hidden';
          }, 600);
        });
      });
      const cerrarModal = document.querySelectorAll('.close');
      cerrarModal.forEach((btn) => {
        btn.addEventListener('click', () => {
          modal.classList.toggle('modal-close');

          setTimeout(() => {
            modalCont.style.opacity = '0';
            modalCont.style.visibility = 'hidden';
          }, 600);
        });
      });
      const btnCloseModal = document.querySelectorAll('.btn-close-not');
      btnCloseModal.forEach((btn) => {
        btn.addEventListener('click', () => {
          modal.classList.toggle('modal-close');

          setTimeout(() => {
            modalCont.style.opacity = '0';
            modalCont.style.visibility = 'hidden';
          }, 600);
        });
      });

      const containerEditModal = document.querySelector('.modal-container-edit');
      containerEditModal.innerHTML = `
          <div class=' modal modal-close-edit'>
          <p class='close-edit'>X</p>
          <div class='modal-texto-edit'>
          <textarea id="edit-content">
          </textarea>
          <button data-id="${conta.id}" id="edit-yes" class="btn-close-yes-edit" src="./lib/views/img/eliminar.png" alt="" >Yes</button>
          <button id="boton-close-not-edit" class="btn-close-not-edit" type="button">No</button>
          </div>
          </div>
          `;
      const modalEdit = document.querySelectorAll('.modal-close-edit')[0];
      const modalContEdit = document.querySelectorAll('.modal-container-edit')[0];

      const abrirModalEdit = document.querySelectorAll('.edit-btn');
      abrirModalEdit.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          modalContEdit.style.opacity = '1';
          modalContEdit.style.visibility = 'visible';
          modalEdit.classList.toggle('modal-close-edit');
          const ojo = document.querySelector('#edit-content');
          const docPost = await getPosts(e.target.dataset.id);
          ojo.innerHTML = docPost.data().content;
          updatepost(docPost, currentPostId);
        });
      });
      const btnEdit = divHome.querySelectorAll('.btn-close-yes-edit');
      btnEdit.forEach((btn) => {
        btn.addEventListener('click', async () => {
          console.log('editing');
          //await updatepost();
          modalEdit.classList.toggle('modal-close-edit');

          setTimeout(() => {
            modalContEdit.style.opacity = '0';
            modalContEdit.style.visibility = 'hidden';
          }, 600);
        });
      });
      const cerrarModalEdit = document.querySelectorAll('.close-edit');
      cerrarModalEdit.forEach((btn) => {
        btn.addEventListener('click', () => {
          modalEdit.classList.toggle('modal-close-edit');

          setTimeout(() => {
            modalContEdit.style.opacity = '0';
            modalContEdit.style.visibility = 'hidden';
          }, 600);
        });
      });
      const btnCloseModalEdit = document.querySelectorAll('.btn-close-not-edit');
      btnCloseModalEdit.forEach((btn) => {
        btn.addEventListener('click', () => {
          modalEdit.classList.toggle('modal-close-edit');

          setTimeout(() => {
            modalContEdit.style.opacity = '0';
            modalContEdit.style.visibility = 'hidden';
          }, 600);
        });
      });
    });
  });
  return divHome;
};
function transformDate(date) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const fecha = new Date(date);
  const year = fecha.getFullYear();
  const month = fecha.getMonth();
  const day = fecha.getDate();
  const hour = fecha.getHours();
  const minute = fecha.getMinutes();

  return year + '/' + months[month] + '/' + day + '  ' + hour + ':' + minute;
}

$(document).ready(() => {
    $(".custom-file-input").on('change',function(){
        $("#preview_div").show()
        $("#preview_div").empty()

        for(let i = 0; i < this.files.length; ++i){
            let filereader = new FileReader();
            let $img = jQuery.parseHTML("<img class='preview-images mx-1' src=''>");
            filereader.onload = function(){
                $img[0].src = this.result;
            };

            filereader.readAsDataURL(this.files[i]);
            $("#preview_div").append($img);
        }

        let len = this.files.length
        if (len > 0)
            $(".custom-file-label").html('Đã chọn ' + this.files.length + ' hình ảnh');
        else 
            $(".custom-file-label").html('Đính kèm ảnh')
    })

    $('#close_new_post_modal').click(() => {
        $('#newPostModal').modal('hide')
        $('#textarea-content').val('')
        $("#preview_div").empty()
        $(".custom-file-label").html('Đính kèm ảnh')
        $("#video-url").val('')
    })

    $('.carousel').carousel({
        interval: false
    })

    $('#submit_new_post').click(() => {
        let form = document.getElementById("new_post_form")
        let formData = new FormData(form)
        formData.append('author', 'dlcvi') //just for test -> will be adjust when login module done

        let url = window.location.origin + '/home/addNewPost/'
        let opts = {
            method: 'POST',
            body: formData
        }

        fetch(url, opts)
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            if (json.status) {
                $('#close_new_post_modal').click()
                updateNewPost(json.result)
            } else { //add new post fail
                console.log('add new post failed');
            }
        })
        .catch(e => {
            console.log('Error occured: ' + e);
        })
    })

    $('#input_tag_new_post').click((e) => {
        e.preventDefault();
    })

    $('#confirmDeleteButton').click(function() {
        let id = $(this).data('id')
        let type = $(this).data('type')

        let baseUrl = window.location.origin + '/home'
        if (type === 'post')
            baseUrl += '/deletePost/' + id
        else if (type === 'comment') {
            let post = $(this).data('post')
            baseUrl += '/deleteComment/' + post + '/' + id
        }

        fetch(baseUrl, {method: 'DELETE'})
        .then(response => {
            return response.json()
        })
        .then(json => {
            if (json.result) {
                let deleted_id = json.deleted
                $(`#${deleted_id}`).remove()

                $('#confirmDeleteModal').modal('hide')
            } else {

            }
        })
        .catch(e => {
            console.log('Error occured: ' + e);
        })
    })

    //dang test chua lam xong
    $('#saveChangeButton').click(() => {
        let id = $('#saveChangeButton').data('comment')
        let post = $('#saveChangeButton').data('post')


        let form = document.getElementById("edit_comment")
        let formData = new FormData(form)
        formData.append('author', '608693aaea2336b22b0ec432') //just for test -> will be adjust when login module done

        let url = window.location.origin + '/home/updateComment/' + post + '/' + id
        let opts = {
            method: 'POST',
            body: formData
        }

        fetch(url, opts)
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            if (json.result) {
                $(`#${id} > div > div.mr-2`).text(json.updated.content)
                $('#editCommentModal').modal('hide')
            } else { //add new post fail
                console.log(json);
                console.log('update comment failed');
            }
        })
        .catch(e => {
            console.log('Error occured: ' + e);
        })
    })

    

    // register.ejs
    $('option').mousedown(function(e) {
        e.preventDefault();
        $(this).prop('selected', !$(this).prop('selected'));
        return false;
    });
    
    $('.permissions-dropdown').click( function (e) {
        e.stopPropagation();
    });

    // profile.ejs
    $("#upload_link").on('click', e => {
        e.preventDefault();
        $("#upload:hidden").trigger('click');
    });
    
    $("#upload").change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function(e) {
                $('#avatar').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(this.files[0]); // convert to base64 string
        }
    });

    
    // new_notification.ejs
    $("#new-notification-btn").click(function() {

        let form = $('#notification-form')[0]
        let data = new FormData(form)
        let url = window.location.origin + "/createNewNotification"

        fetch(url, {
            method: 'POST',
            body: data
        })
        .then(() => {
        })
        .catch(error => console.log(error))
    })

    $('#new-notification-btn-cancel').click(function() {
        $('#new-notification').modal('hide')
    })


});

//handle event append elements
$(document).on('click', '.delete-post-comment', function() {
    let id = $(this).data('id')
    let type = $(this).data('type')

    if (type == 'comment') {
        $('#confirmDeleteButton').data('post', $(this).data('post'))
        $('#modal-title').text('Xác nhận xóa bình luận')
        $('#modal-content').text('Bạn có chắc chắn muốn xóa bình luận này?')
    } 

    $('#confirmDeleteButton').data('id', id)
    $('#confirmDeleteButton').data('type', type)
    
    $('#confirmDeleteModal').modal('show')
});

$(document).on('click', '.submit_new_comment', function() {
    let form = $(this).closest("form.new_comment_form")
    let formData = new FormData(form[0])
    formData.append('author', '6085851e4e6af481eba8c324') //just for test -> will be adjust when login module done

    let postId = $(this).data('id')
    let url = window.location.origin + '/home/addNewComment/' + postId
    let opts = {
        method: 'POST',
        body: formData
    }

    fetch(url, opts)
    .then((response) => {
        return response.json()
    })
    .then((json) => {
        if (json.result) {
            updateNewComment(json.comment, postId)
            $(form[0][0]).val('')
        } else { //add new post fail
            console.log('add new comment failed');
            console.log(json);
        }
    })
    .catch(e => {
        console.log('Error occured: ' + e);
    })
});

$(document).on('click', '.show-all-comment', (event) => {
    let str = event.target.innerHTML;
    let show = "Hiển thị tất cả bình luận";
    let hide = "Ẩn tất cả bình luận";

    if (str.localeCompare(show) === 0) {
        event.target.innerHTML = hide
    } else if (str.localeCompare(hide) === 0) {
        event.target.innerHTML = show
    }
})

$(document).on('click', '.edit-comment', (event) => {
    let commentId = $(event.target).data('id')
    let postId = $(event.target).data('post')
    let content = $.trim($(`#${commentId} > div > div.mr-2`).text());

    console.log({commentId, postId});
    $('#edit_comment > input').val(content)
    $('#saveChangeButton').data('comment', commentId)
    $('#saveChangeButton').data('post', postId)

    $('#editCommentModal').modal('show')
})

function updateNewPost(result) {
    let postTime = new Date(result.lastUpdate).toLocaleString().split(',')
    postTime = postTime[0] + ' ' + postTime[1];
        
    let ImageArr = result.imgUrl
    let carousel = ''
    if (ImageArr.length > 0) {
        let baseUrl = window.location.origin, divElement = '', carousel_id = 'carousel-' + result._id 

        carousel = `
        <div class="mt-3">
            <div id="${carousel_id}" class="carousel slide" data-ride="carousel" data-interval="false">
                <ol class="carousel-indicators">`
        
        ImageArr.forEach((image, index) => {
            carousel += `<li data-target="#${carousel_id}" data-slide-to="${index}" class="active"></li>`

            let isActive = index == 0 ? 'active' : ''
            divElement += `
            <div class="carousel-item ${isActive}">
                <img class="d-block w-100" src="${baseUrl + '/' + image}">
            </div>`
        })

        carousel += `
                </ol>
                <div class="carousel-inner">
                    ${divElement}
                </div>
                <a class="carousel-control-prev" href="#${carousel_id}" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next" href="#${carousel_id}" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </a>
            </div>
        </div>
        `
    }

    let newPost = 
    `<div id="${result._id}" class="my-3 p-2 bg-white rounded shadow-sm">
        <div class="media">
            <img class="mr-3" src="https://res.cloudinary.com/mhmd/image/upload/v1556074849/avatar-1_tcnd60.png" alt="Generic placeholder image">
            <div class="media-body">
                <!-- post infor -->
                <div class="d-flex align-items-center">
                    <span class="font-weight-bold h5 mr-auto"><a href="" class="writer-name">Jason Doe</a></span>
                    <div><small class="text-muted mb-2 mx-3">${postTime}</small></div>
                    
                    <div class="mr-2">
                        <div class="btn-group dropright">
                            <button type="button" class="btn more-option rounded-circle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 20 20">
                                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                </svg>
                            </button>
                            <div class="dropdown-menu">
                            <a class="dropdown-item edit-post" data-id="${result._id}">Chỉnh sửa bài viết</a>
                            <a class="dropdown-item delete-post-comment" data-id="${result._id}" data-type="post">Xoá bài viết</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end post info -->

                <!-- post content -->
                <div class="div-content">${result.content}</div>
                ${carousel}
                <hr>
                <div class="mt-3 new-comment-area">
                <form method="POST" class="new_comment_form">
                    <div class="form-row d-flex align-items-center">
                        <div class="col-1">
                            <img src="https://res.cloudinary.com/mhmd/image/upload/v1556074849/avatar-1_tcnd60.png" width="65" class="mr-3 rounded-circle img-thumbnail shadow-sm">
                        </div>
                        <div class="col-9">
                            <input name="content" type="text" class="form-control" placeholder="Nhập nội dung bình luận...">
                        </div>
                        <div class="col-2">
                            <button type="button" data-id="${result._id}" class="btn btn-primary submit_new_comment">Bình luận</button>
                        </div>            
                    </div>                                                
                </form>
            </div>
                `
    $( ".list-post" ).prepend(newPost)
}

function updateNewComment(newComment, postId) {

    let commentTime = new Date(newComment.date).toLocaleString().split(',')
    commentTime = commentTime[0] + ' ' + commentTime[1];

    let newCommentHTML = `<!-- comment -->
    <div class="media mt-3" id="${newComment._id}">
        <img class="mr-3" height="58px" width="58px" src="https://res.cloudinary.com/mhmd/image/upload/v1556074849/avatar-1_tcnd60.png" alt="Generic placeholder image">
        <div class="media-body">
            <!-- comment infor -->
            <div class="d-flex align-items-center">
                <span class="font-weight-bold h5 mr-auto"><a href="" class="writer-name">Jason Doe</a></span>
                <div><small class="text-muted mb-2 mx-3">${commentTime}</small></div>
                
                <div class="mr-2">
                    <div class="btn-group dropright">
                        <button type="button" class="btn more-option rounded-circle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 20 20">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item edit-comment" data-id="${newComment._id}" data-post="${postId}">Chỉnh sửa bình luận</a>
                            <a class="dropdown-item delete-post-comment" data-id="${newComment._id}" data-type="comment" data-post="${postId}">Xoá bình luận</a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- end comment infor -->

            <!-- comment content -->
            <div class="mr-2">
                ${newComment.content}
            </div>
            <!-- end comment content  -->
        </div>
    </div>
    <!-- end comment -->`

    if($(`#comment-post-${postId}`).length == 0) { //don't comment list have before
        let insertElement = 
        `<!-- comment list -->
            <div>
                <a class="show-all-comment" data-toggle="collapse" data-target="#comment-post-${postId}" aria-expanded="false" aria-controls="collapseExample">Hiển thị tất cả bình luận</a>
            </div>
            <div class="collapse list-comment" id="comment-post-${postId}"> 
                ${newCommentHTML}
            </div>
        <!-- end comment list -->`

        $(insertElement).insertBefore(`#${postId} > .media > .media-body > .new-comment-area`)
    } else {
        $(`#comment-post-${postId}`).append(newCommentHTML)
    }
}

// google sign in (login.ejs)
function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;

    let url = window.location.origin + '/auth/googlelogin'

    fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                'id_token': id_token
            })
        })
        .then(json => json.json())
        .then(result => {
            if (result.result === "success") {

                let redi = window.location.origin + 'home'
                window.location.replace(redi);
            } else {
                signOut()
                console.log(result);
            }
        })
        .catch(err => console.log(err))
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out.');
    });
}

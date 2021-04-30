window.onload = function(e) {
    if (window.location.pathname === '/home' || window.location.pathname === '/home/') {
        getListPost(1)
    }
    else if (window.location.pathname.includes('home/wall')) {
        let id = $('#personal-fullname').data('id')
        getListPost(1, id)
    }
    else if (!window.location.pathname.includes("auth")) {
    
        const socket = io();
        
        socket.on('connect', () => console.log("kết nối thành công"))
        
        socket.on('new_notification', (notiInfo) => {

        let author = notiInfo.author
        let noti = notiInfo.noti
        
        $('#toast-notification').toast("show")
        $('#toast-notification-title').text(author + " vừa có một thông mới")
        $('#toast-notification-content').text(noti.title)

            $('#toast-notification').attr("data-noti-link", notiInfo.link_detail)
        })
    }

    $('.date-time-format').get().forEach((el) => {
        let postTime = new Date($(el)[0].innerHTML).toLocaleString().split(',')
        postTime = postTime[0] + ' ' + postTime[1];
         $(el)[0].innerHTML = postTime
    })
}

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
        // $('#textarea-content').val('')
        $("#preview_div").empty()
        $(".custom-file-label").html('Đính kèm ảnh')
        $("#video-url").val('')
        $('#new_post_form').find("input, textarea").val("");
    })

    $('.carousel').carousel({
        interval: false
    })

    $('#submit_new_post').click(() => {

        let form = $("#new_post_form")
        let formData = new FormData(form[0])
        let author = $('#user-id').data('id')
        formData.append('author', author) //just for test -> will be adjust when login module done

        let url = window.location.origin + '/home/addNewPost/'

        let postId = $('#submit_new_post').data('id')
        if (postId) { //it mean change post because modal has post id
            url = window.location.origin + '/home/updatePost/' + postId
        }
         
        let opts = {
            method: 'POST',
            body: formData
        }

        let avatar = $('.user-avatar').attr('src')
        let fullname = $.trim($('#user-id > div > div > h4').text())

        fetch(url, opts)
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            if (json.status) {
                if (!postId) updatePost(json.result, {avatar, fullname, _id: $('#user-id').data('id')}, true)
                else if (postId) updateExistPost(json.result)

                $('#close_new_post_modal').click()
            } else { //add new post fail
                console.log('add new post failed');
            }
            console.log(json);
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

    let count = 1
    $('.right-part').scroll(function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            count++
            getListPost(count)
        }
    });

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

    $('#new-notification-btn-cancel').click(function() {
        $('#new-notification').modal('hide')
    })

    $('#toast-notification').click(function() {
        console.log(window.location.href);
        window.location.replace(window.location.origin + $('#toast-notification').attr('data-noti-link'))
    })

    $('#amend-notification-btn').click(function() {
        let title = $('#notification-details-title').text()
        let content = $('#notification-details-content').text()
        let subject = $('#notification-details-subject').text().split("|")[0].slice(0, -1)

        $('#amend-notification-title').val(title)
        $('#amend-notification-content').val(content)
        $('select option[value="' + subject + '"]').attr('selected', 'selected')
    })

    $('#amend-notification-btn-modal').click(function() {
        let url = window.location.href
        let id = url.substring(url.lastIndexOf('/') + 1)
        
        url = window.location.origin + "/notification/updateNotification"

        let form = document.getElementById('amend-notification-form')
        form = new FormData(form)
        form.append("noti_id", id)

        fetch(url, {
            method: 'POST',
            body: form
        })
        .then(json => json.json())
        .then(data => {
            console.log(data.result);
            if (data.result == "Success") {
                $('#amend-notification').trigger("reset").modal("hide")
                
                updateDetailNotification(data.noti)
            }
        })
        .catch(error => console.log(error))

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
    let author = $('#user-id').data('id')
    formData.append('author', author)

    let postId = $(this).data('id')
    let url = window.location.origin + '/home/addNewComment/' + postId
    let opts = {
        method: 'POST',
        body: formData
    }

    let id = $('#user-id').data('id')
    let avatar = $('.user-avatar').attr('src')
    let fullname = $.trim($('#user-id > div > div > h4').text())

    fetch(url, opts)
    .then((response) => {
        return response.json()
    })
    .then((json) => {
        if (json.result) {
            updateComment(json.comment, {id, avatar, fullname}, postId)
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

        let postId = $(event.target).data('target').split('-')[2]

        let url = window.location.origin + '/home/getComments/' + postId
        let opts = { method: 'GET' }
    
        fetch(url, opts)
        .then((response) => {
            return response.json()
        })
        .then((json) => {
            if (json.result) {
                json.comments.forEach(comment => {
                    updateComment(comment, comment.author, postId)
                })
            } else { //fetch comments fail
                console.log(json);
                console.log('get all comment failed');
            }
        })
        .catch(e => {
            console.log('Error occured: ' + e);
        })
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

$(document).on('click', '.edit-post', (event) => {
    $('.modal-title').text('Chỉnh sửa bài đăng')
    $('#submit_new_post').text('Lưu thay đổi')

    let postId = $(event.target).data('id')
    let content = $.trim($(`#${postId} > div > div > div.div-content`).text());

    $('#textarea-content').val(content)

    let nImage = $(`#carousel-${postId} > div > div`).length
    if (nImage > 0) {
        $(".custom-file-label").html('Đã chọn ' + nImage + ' hình ảnh');

        $("#preview_div").show()
        $("#preview_div").empty()
        
        for(let i = 0; i < nImage; i++) {
            let src = $(`#carousel-${postId} > div > div`).get(i).children[0].getAttribute('src')
            
            let $img = `<img class='preview-images mx-1' src='${src}'>`
            $("#preview_div").append($img);
        }    
    } else {
        $(".custom-file-label").html('Đính kèm ảnh')
    }

    let youtubeUrl = undefined
    if ($(`#video-url-${postId}`).length > 0) {
        youtubeUrl = $(`#video-url-${postId}`).attr('src')
    }

    if (youtubeUrl) $('#video-url').val(youtubeUrl)

    $('#submit_new_post').data('id', postId)

    $('#newPostModal').modal('show')
})

$(document).on('keypress',  function (e) {
    if($('#newPostModal').is(':visible')) {
        let key = e.which;
        if (key == 13) { 
            $('#submit_new_post').click();
        }
    }
});

$(document).on('submit', '.new_comment_form', (event) => {
    event.preventDefault()
    $(event.target).find('.submit_new_comment').click();
})

$(document).on('submit', '#newPostModal', (event) => {
    event.preventDefault()
    $(event.target).find('.submit_new_post').click();
})

function updateDetailNotification(noti) {
    $('#notification-details-title').text(noti.title)
    $('#notification-details-content').text(noti.content)

    let img_div = file_div = '<div class="my-4">'
    noti.files.forEach(file => {
        if (file.Type.includes("image")) {
            img_div += `<img src="../../${file.Src}" alt="" class="w-25 h-50 m-3 rounded">`
        } else {
            file_div += `<a href="../../${file.Src.split('&')[0]}" download=""> ${file.Src.split('&')[1]} </a>`
        }

    })
    img_div += '</div>'
    file_div += '</div>'

    $('#files_detail_area').html(img_div + file_div)

    let author = noti.author.fullname || ''
    $('#author_detail_area').text(author)

    $('#notification-details-subject').text(noti.subject + "| Ngày đăng: " + noti.date)

    console.log(noti.date)
}

function updatePost(result, author, isPrepend) {
    let postTime = new Date(result.lastUpdate).toLocaleString().split(',')
    postTime = postTime[0] + ' ' + postTime[1];
        
    let ImageArr = result.imgUrl
    let carousel = ''
    let user = $('.user-avatar')

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

    let videoHTML = ''
    if (result.videoUrl) {
        videoHTML = `                                        
        <div class="mt-3">
            <iframe id="video-url-${result._id}" class="youtube-video-frame" width="100%" height="100%" src="${result.videoUrl}">
            </iframe>
        </div>`
    }

    let show_hide_commentsHTML = ''
    if (result.comments.length > 0) {
        show_hide_commentsHTML =         
        `<!-- comment list -->
        <div>
            <a class="show-all-comment" data-toggle="collapse" data-target="#comment-post-${result._id}" aria-expanded="false" aria-controls="collapseExample">Hiển thị tất cả bình luận</a>
        </div>
        <div class="collapse list-comment" id="comment-post-${result._id}"> 
        </div>
        <!-- end comment list -->`
    }

    let currentUserName = $.trim($("#user-id > div > div > h4").text())
    let postToolHTML = ''
    if (currentUserName === author.fullname) {
        postToolHTML = `
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
        </div>`
    }

    let newPost = 
    `<div id="${result._id}" class="my-3 p-2 bg-white rounded shadow-sm">
        <div class="media">
            <img class="mr-3 rounded-circle img-thumbnail shadow-sm author-post-avatar" src="${author.avatar}" alt="author avatar">
            <div class="media-body">
                <!-- post infor -->
                <div class="d-flex align-items-center">
                    <span class="font-weight-bold h5 mr-auto"><a href="${window.location.origin + '/home/wall/' + author._id}" class="writer-name">${author.fullname}</a></span>
                    <div><small class="text-muted mb-2 mx-3">${postTime}</small></div>
                    
                    ${postToolHTML}
                </div>
                <!-- end post info -->

                <!-- post content -->
                <div class="div-content">${result.content}</div>
                ${carousel}
                ${videoHTML}
                <hr>
                ${show_hide_commentsHTML}
                <div class="mt-3 new-comment-area">
                <form method="POST" class="new_comment_form">
                    <div class="form-row d-flex align-items-center">
                        <div class="col-1">
                            <img src="${$(user).attr('src')}" width="56" class="mr-3 rounded-circle img-thumbnail shadow-sm author-comment-avatar">
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
    if (isPrepend) $( ".list-post" ).prepend(newPost)
    else if (!isPrepend) $(".list-post").append(newPost)
        
}

function updateExistPost(updatedPost) {
    let postTime = new Date(updatedPost.lastUpdate).toLocaleString().split(',')
    postTime = postTime[0] + ' ' + postTime[1];
        
    let ImageArr = updatedPost.imgUrl
    let carouselHTML = ''
    let user = $('.user-avatar')
    let authorName = $.trim($("#user-id > div > div > h4").text())

    if (ImageArr.length > 0) {
        let baseUrl = window.location.origin, divElement = '', carousel_id = 'carousel-' + updatedPost._id 

        carouselHTML = `
        <div class="mt-3">
            <div id="${carousel_id}" class="carousel slide" data-ride="carousel" data-interval="false">
                <ol class="carousel-indicators">`
        
        ImageArr.forEach((image, index) => {
            carouselHTML += `<li data-target="#${carousel_id}" data-slide-to="${index}" class="active"></li>`

            let isActive = index == 0 ? 'active' : ''
            divElement += `
            <div class="carousel-item ${isActive}">
                <img class="d-block w-100" src="${baseUrl + '/' + image}">
            </div>`
        })

        carouselHTML += `
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

    let videoHTML = ''
    if (updatedPost.videoUrl) {
        videoHTML = `                                        
        <div class="mt-3">
            <iframe id="video-url-${updatedPost._id}" class="youtube-video-frame" width="100%" height="100%" src="${updatedPost.videoUrl}">
            </iframe>
        </div>`
    }

    let show_hide_commentsHTML = ''
    if (updatedPost.comments.length > 0) {
        show_hide_commentsHTML =         
        `<!-- comment list -->
        <div>
            <a class="show-all-comment" data-toggle="collapse" data-target="#comment-post-${updatedPost._id}" aria-expanded="false" aria-controls="collapseExample">Hiển thị tất cả bình luận</a>
        </div>
        <div class="collapse list-comment" id="comment-post-${updatedPost._id}"> 
        </div>
        <!-- end comment list -->`
    }

    let postToolHTML = `
    <div class="mr-2">
        <div class="btn-group dropright">
            <button type="button" class="btn more-option rounded-circle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 20 20">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
            </button>
            <div class="dropdown-menu">
            <a class="dropdown-item edit-post" data-id="${updatedPost._id}">Chỉnh sửa bài viết</a>
            <a class="dropdown-item delete-post-comment" data-id="${updatedPost._id}" data-type="post">Xoá bài viết</a>
            </div>
        </div>
    </div>`

    let updatePost = 
    `<div class="media">
        <img class="mr-3 rounded-circle img-thumbnail shadow-sm author-post-avatar" src="${$(user).attr('src')}" alt="author avatar">
        <div class="media-body">
            <!-- post infor -->
            <div class="d-flex align-items-center">
                <span class="font-weight-bold h5 mr-auto"><a href="href="${window.location.origin + '/home/wall/' + $('#user-id').data('id')}"" class="writer-name">${authorName}</a></span>
                <div><small class="text-muted mb-2 mx-3">${postTime}</small></div>
                
                ${postToolHTML}
            </div>
            <!-- end post info -->

            <!-- post content -->
            <div class="div-content">${updatedPost.content}</div>
            ${carouselHTML}
            ${videoHTML}
            <hr>
            ${show_hide_commentsHTML}
            <div class="mt-3 new-comment-area">
            <form method="POST" class="new_comment_form">
                <div class="form-row d-flex align-items-center">
                    <div class="col-1">
                        <img src="${$(user).attr('src')}" width="56" class="mr-3 rounded-circle img-thumbnail shadow-sm author-comment-avatar">
                    </div>
                    <div class="col-9">
                        <input name="content" type="text" class="form-control" placeholder="Nhập nội dung bình luận...">
                    </div>
                    <div class="col-2">
                        <button type="button" data-id="${updatedPost._id}" class="btn btn-primary submit_new_comment">Bình luận</button>
                    </div>            
                </div>                                                
            </form>`

    $(`#${updatedPost._id}`).html(updatePost)
}

function updateComment(newComment, author, postId) {
    
    console.log(author + 'updateComment');

    if ($(`#${newComment._id}`).length > 0) {
        if ($.trim($(`#${newComment._id} > div > div.mr-2`).text()) !== newComment.content) {
            $(`#${newComment._id} > div > div.mr-2`).text(newComment.content)
        }

        return
    }

    let commentTime = new Date(newComment.date).toLocaleString().split(',')
    commentTime = commentTime[0] + ' ' + commentTime[1];

    let currentUserName = $.trim($("#user-id > div > div > h4").text())
    let commentToolHTML = ''
    if (currentUserName === author.fullname) {
        commentToolHTML = `
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
        </div>`
    } else {
        commentToolHTML = `
        <div class="mr-2 empty-option">
        </div>`
    }

    let newCommentHTML = `<!-- comment -->
    <div class="media mt-3" id="${newComment._id}">
        <img class="mr-3 author-comment-avatar rounded-circle img-thumbnail shadow-sm" height="58px" width="58px" src="${author.avatar}" alt="author comment">
        <div class="media-body">
            <!-- comment infor -->
            <div class="d-flex align-items-center">
                <span class="font-weight-bold h6 mr-auto"><a href="${window.location.origin + '/home/wall/' + author._id}" class="writer-name">${author.fullname}</a></span>
                <div><small class="text-muted mb-2 mx-3">${commentTime}</small></div>
                
                ${commentToolHTML}
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

    if($(`#comment-post-${postId}`).length == 0) { //don't have comment list before
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

function getListPost(page, condition = '') {
    let url 
    if (condition === '') url = window.location.origin + '/home/getPosts/' + page
    else url = window.location.origin + '/home/getPostsOfUser/' + condition + '/' + page
    
    console.log(url);
    
    let opts = { method: 'GET' }
    fetch(url, opts)
    .then((response) => {
        return response.json()
    })
    .then((json) => {
        if (json.result) {
            json.posts.forEach(post => {
                updatePost(post, post.author, false)
            })
        } else { //add new post fail
            console.log(json);
            console.log('add new post failed');
        }
    })
    .catch(e => {
        console.log('Error occured: ' + e);
    })
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

                let redi = window.location.origin + '/account/profile'
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
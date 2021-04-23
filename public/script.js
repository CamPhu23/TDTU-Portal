$(document).ready(() => {
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\\").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });

    $(".show-all-comment").click(() => {
        let str = $(".show-all-comment").html();

        console.log(str);

        let show = "Hiển thị tất cả bình luận";
        let hide = "Ẩn tất cả bình luận";

        if (str.localeCompare(show) === 0) {
            $(".show-all-comment").html(hide);
            console.log("hide");
        } else if (str.localeCompare(hide) === 0) {
            $(".show-all-comment").html(show);
            console.log("show");
        }
        

    });
});
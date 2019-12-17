// home page side bar toggler
    $(document).ready(function () {
        $("#sidebar").mCustomScrollbar({
            theme: "minimal"
        });

        $('#dismiss, .overlay').on('click', function () {
            // hide sidebar
            $('#sidebar').removeClass('active');
            // hide overlay
            $('.overlay').removeClass('active');
        });

        $('#sidebarCollapse').on('click', function () {
            // open sidebar
            $('#sidebar').addClass('active');
            // fade in the overlay
            $('.overlay').addClass('active');
            $('.collapse.in').toggleClass('in');
            $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        });
    });

    
// // multiple image upload preview
// $(document).ready(function() {
//         let imagesPreview1 = function(input, placeToInsertImagePreview) {
//           if (input.files) {
//             let filesAmount = input.files.length;
//             for (i = 0; i < filesAmount; i++) {
//               let reader = new FileReader();
//               reader.onload = function(event) {
//               	document.getElementById("prev-text").innerHTML = "Image preview";
//                 $($.parseHTML("<img>"))
//                   .attr("src", event.target.result)
//                   .addClass("w-25 pr-2 rounded")
//                   .appendTo(placeToInsertImagePreview);
//               };
//               reader.readAsDataURL(input.files[i]);
//             }
//           }
//         };
//         $("#cover").on("change", function() {
//           imagesPreview(this, "div.preview-cover");
//         });
//       });


//multiple image upload preview
// $(document).ready(function() {
//         let imagesPreview2 = function(input, placeToInsertImagePreview) {
//           if (input.files) {
//             let filesAmount = input.files.length;
//             for (i = 0; i < filesAmount; i++) {
//               let reader = new FileReader();
//               reader.onload = function(event) {
//                 document.getElementById("prev-text").innerHTML = "Image preview";
//                 $($.parseHTML("<img>"))
//                   .attr("src", event.target.result)
//                   .addClass("w-25 pr-2 rounded")
//                   .appendTo(placeToInsertImagePreview);
//               };
//               reader.readAsDataURL(input.files[i]);
//             }
//           }
//         };
//         $("#images").on("change", function() {
//           imagesPreview(this, "div.preview-images");
//         });
//       });
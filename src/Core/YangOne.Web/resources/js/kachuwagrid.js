var kachuwagrid;
(function ($) {

    var kachuwaGrid = function () {
        var ajaxCall = function (url, param, successFx, error) {
            $.ajax({
                type: "POST",
                //contentType: "application/json; charset=utf-8",
                async: false,
                url: url,
                data: param,
                success: successFx,
                error: error
            });
        };
        var commands = [];

        $(".kachuwa-grid").find("tbody>tr").each(function (i, x) {
            var $tr = $(x);
            $tr.data('kachuwa-item', $tr.data('item'));

        });
        //$(".kachuwa-grid").each(function(index, item) {
        //    //attaching commands events
        //    var commands = $(item).find("a.command-link");
        //    commands.each(function(i, c) {
        //        $(c).on("click",
        //            function() {

        //            });
        //    });

        //});

        kachuwagrid = {};

        kachuwagrid.delete = function (elem, options) {

            if (confirm("Are you sure want to delete?")) {
                var api = $(elem).attr('callbackApi');
                if (typeof (options) == 'object') {
                    alert('please extend the  kachuwagrid.delete api');
                } else {
                    ajaxCall(api,
                        { id: options },
                        function (response) {

                            window.location.reload();

                        },
                        function (response) { });
                }

            }
        }

        $(document).find(".form-switch input:checkbox").on("change",
            function () {
                $(this).val($(this).is(":checked"));
            });


    }();
    var kachuwaForm = function () {

      

        var kachuwaImagePreview = function () {
            // Display the images to be uploaded.
            var multiPhotoDisplay;
            var clearImage = function ($elem) {
                $elem.parents("div:eq(0)").find(".image_preview").html('');
            }
            $('.k-image-uploader').on('change',
                function (e) {
                    clearImage($(this));
                    return multiPhotoDisplay(this);
                });

            this.readURL = function (input) {
                var reader;
                // Read the contents of the image file to be uploaded and display it.
                var $elem = $(input);
                if (input.files && input.files[0]) {
                    reader = new FileReader();
                    reader.onload = function (e) {
                        showPreview($elem, input.files[0].name, e.target.result);
                    };
                    return reader.readAsDataURL(input.files[0]);
                }
            };

            multiPhotoDisplay = function (input) {
                var $elem = $(input);
                var file, i, len, reader, ref;
                // Read the contents of the image file to be uploaded and display it.

                if (input.files && input.files[0]) {
                    ref = input.files;
                    for (i = 0, len = ref.length; i < len; i++) {
                        file = ref[i];
                        reader = new FileReader();
                        reader.onload = function (e) {
                            showPreview($elem,file.name, e.target.result);
                        };
                        reader.readAsDataURL(file);
                    }

                }
            };
            var showPreview = function ($elem,name, src) {
                $elem.parents("div:eq(0)").find(".image_preview").html('').html("<img src='" +
                    src +
                    "' data-img='" +
                    src +
                    "' width='60' data-name='" +
                    name +
                    "'/>");
            }
            $(".choose_from_uploaded").on("click",
                function() { $elem.parents("div:eq(1)").find(".k-image-uploader").trigger("click"); });

        };
        var init = function () {

            var script = document.createElement('script');
            script.src = " /lib/tinymce/tinymce.min.js";
            script.onload = function () {
                //do stuff with the script
                //console.log("tinemcy loaded.");
                tinymce.init({
                    selector: ".editor", //'#txtQuestion',  // change this value according to your HTML
                    autosave_ask_before_unload: false,
                    powerpaste_allow_local_images: true,
                    plugins: [
                       'code', 'a11ychecker', 'advcode', 'advlist', 'anchor', 'autolink', 'codesample', 'fullscreen', 'help',
                        'image', 'editimage', 'tinydrive', 'lists', 'link', 'media', 'powerpaste', 'preview',
                        'searchreplace', 'table', 'template', 'tinymcespellchecker', 'visualblocks', 'wordcount'
                    ],
                   
                    toolbar: 'code insertfile a11ycheck undo redo | bold italic | forecolor backcolor | template codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image',
                    spellchecker_dialog: true,
                    spellchecker_ignore_list: ['Ephox', 'Moxiecode'],
                    //tinydrive_token_provider: (success, failure) => {
                    //    success({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZG9lIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Ks_BdfH4CWilyzLNk8S2gDARFhuxIauLa8PwhdEQhEo' });
                    //},
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
               ,
                    setup: function (ed) {
                        ed.on('change',
                            function (e) {
                                console.log(tinyMCE.activeEditor.id, tinyMCE.activeEditor);
                                $("#" + tinyMCE.activeEditor.id).html(ed.getContent());
                            });
                    },
                    cleanup: false,
                    valid_elements: '+*[*]',
                    entity_encoding: "raw",
                    extended_valid_elements:
                        '@[name|params|source|page|pagesize|rowtotal|api|component],component[name|params],markdown[source],pagination[page|pagesize|rowtotal|api],plugin[component|name|params]',
                    custom_elements: 'component,markdown,module,pagination,plugin,theme',
                    // content_css: '/Themes/Shared/M2/css/theme.min.css',
                    fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
                    file_picker_callback: function (callback, value, meta) {
                        if (meta.filetype == 'image')
                            $('#editorfiles').click();
                    }
                });


                $(document).off("change", '#editorfiles').on("change",
                    '#editorfiles',
                    function () {
                        var fileUpload = $("#editorfiles").get(0);
                        var files = fileUpload.files;
                        var data = new FormData();
                        for (var i = 0; i < files.length; i++) {
                            data.append(files[i].name, files[i]);
                            data.append("fdr", "editor");
                        }

                        $.ajax({
                            url: "/api/v1/kachuwa/grid/ajaxupload",
                            type: "POST",
                            data: data,
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                var message = response.Data;
                                var img = "<img style = 'height:80px;width:80px' src = '" +
                                    message.savedFilePath +
                                    "' />";
                                tinyMCE.activeEditor.execCommand("mceInsertContent", true, img);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                //if fails
                            }
                        });
                    });
            };

            document.head.appendChild(script); //or something of the likes
            //$.getScript("/resources/tinymce/tinymce.js",
            //    function (data, textStatus, jqxhr) {
            //        console.log(data); // Data returned
            //        console.log(textStatus); // Success
            //        console.log(jqxhr.status); // 200

            //    });
            $(".kachuwa-form").find(".switch input:checkbox").on("change",
                function () {
                    //console.log(this);
                    $(this).val($(this).is(":checked"));
                });
            //$.getScript("/resources/", function (data, textStatus, jqxhr) {
            //    console.log(data); // Data returned
            //    console.log(textStatus); // Success
            //    console.log(jqxhr.status); // 200
            //    console.log("Load was performed.");
            //});
            if ($(".kachuwa-tags").length > 0)
                $(".kachuwa-tags").tagsinput({ tagClass:"text-white bg-primary p-1"});
            if ($(".date").length > 0)
                $(".date").datepicker({ format: 'mm/dd/yyyy' });
            if ($(".datetimepicker").length > 0)
                $(".datetimepicker").datetimepicker({
                    //locale: 'ru',
                    //icons: {
                    //    time: "fa fa-clock-o",
                    //    date: "fa fa-calendar",
                    //    up: "fa fa-arrow-up",
                    //    down: "fa fa-arrow-down"
                    //},
                    // viewMode: 'years'

                });
            $(document).off("click", '.input-group-addon').on("click",
                ".input-group-addon",
                function() {
                    $(this).prev("input").trigger('focus');
                });
            //"<script src='~/resources/tinymce/tinymce.js'></script>
            var script1 = document.createElement('script');
            script1.src = "/lib/bootstrap-select/js/bootstrap-select.min.js";
            document.getElementsByTagName('head')[0].appendChild(script1);
            script1.onload = function () {
                $('.selectpicker').selectpicker({
                    //style: 'btn-default',
                    liveSearch: true              
                });
            }
            kachuwaImagePreview();
        }();
    }();

}(jQuery))
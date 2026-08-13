$(document).ready(function () {

    /*************** Navigation *****************/

    var $header = $("#site-header");
    var $nav = $("#site-nav");
    var $toggle = $("#nav-toggle");

    function setHeaderState() {
        $header.toggleClass("is-scrolled", $(window).scrollTop() > 12);
    }

    setHeaderState();
    $(window).on("scroll", setHeaderState);

    $toggle.on("click", function (e) {
        e.stopPropagation();
        var open = !$("body").hasClass("nav-open");
        $("body").toggleClass("nav-open", open);
        $toggle.attr("aria-expanded", open ? "true" : "false");
    });

    $nav.find(".nav-link").on("click", function () {
        $("body").removeClass("nav-open");
        $toggle.attr("aria-expanded", "false");
    });

    $(document).on("click", function (e) {
        if (!$("body").hasClass("nav-open")) return;
        if ($(e.target).closest("#site-nav, #nav-toggle").length) return;
        $("body").removeClass("nav-open");
        $toggle.attr("aria-expanded", "false");
    });

    /*************** Gallery ******************/

    if ($(".tm-gallery").length && $.fn.isotope) {
        var itemSelector = ".tm-gallery-item";
        // Keep page size a multiple of column count so rows stay full
        // 1-col ≤480 → 6 | 2-col ≤768 → 8 | 3-col ≤960 → 9 | 4-col → 12
        var responsiveIsotope = [[480, 6], [768, 8], [960, 9]];
        var itemsPerPageDefault = 12;
        var itemsPerPage = defineItemsPerPage();
        var currentNumberPages = 1;
        var currentPage = 1;
        var currentFilter = "*";
        var filterValue = "";
        var pageAttribute = "data-page";
        var pagerClass = "tm-paging";
        var $container = $(".tm-gallery").isotope({
            itemSelector: itemSelector
        });

        $container.imagesLoaded().progress(function () {
            $container.isotope("layout");
        });

        function changeFilter(selector) {
            $container.isotope({ filter: selector });
        }

        function goToPage(n) {
            currentPage = n;
            var selector = itemSelector;
            var exclusives = [];

            if (currentFilter != "*") {
                exclusives.push(selector + "." + currentFilter);
            }

            filterValue = exclusives.length ? exclusives.join("") : "*";

            var wordPage = currentPage.toString();
            filterValue += "." + wordPage;
            changeFilter(filterValue);
        }

        function defineItemsPerPage() {
            var pages = itemsPerPageDefault;

            for (var i = 0; i < responsiveIsotope.length; i++) {
                if ($(window).width() <= responsiveIsotope[i][0]) {
                    pages = responsiveIsotope[i][1];
                    break;
                }
            }
            return pages;
        }

        function setPagination() {
            var SettingsPagesOnItems = (function () {
                var itemsLength = $container.children(itemSelector).length;
                var pages = Math.ceil(itemsLength / itemsPerPage);
                var item = 1;
                var page = 1;
                var exclusives = [];

                if (currentFilter != "*") {
                    exclusives.push(itemSelector + "." + currentFilter);
                }

                filterValue = exclusives.length ? exclusives.join("") : "*";

                $container.children(filterValue).each(function () {
                    if (item > itemsPerPage) {
                        page++;
                        item = 1;
                    }
                    var wordPage = page.toString();

                    var classes = $(this).attr("class").split(" ");
                    var lastClass = classes[classes.length - 1];

                    if (lastClass.length < 4) {
                        $(this).removeClass();
                        classes.pop();
                        classes.push(wordPage);
                        classes = classes.join(" ");
                        $(this).addClass(classes);
                    } else {
                        $(this).addClass(wordPage);
                    }
                    item++;
                });
                currentNumberPages = page;
            })();

            var CreatePagers = (function () {
                var $isotopePager =
                    $("." + pagerClass).length == 0
                        ? $('<div class="' + pagerClass + '"></div>')
                        : $("." + pagerClass);

                $isotopePager.html("");
                if (currentNumberPages > 1) {
                    for (var i = 0; i < currentNumberPages; i++) {
                        var $pager = "";

                        if (currentPage == i + 1) {
                            $pager = $(
                                '<a href="javascript:void(0);" class="active tm-paging-link" ' +
                                    pageAttribute +
                                    '="' +
                                    (i + 1) +
                                    '"></a>'
                            );
                        } else {
                            $pager = $(
                                '<a href="javascript:void(0);" class="tm-paging-link" ' +
                                    pageAttribute +
                                    '="' +
                                    (i + 1) +
                                    '"></a>'
                            );
                        }

                        $pager.html(i + 1);

                        $pager.click(function () {
                            $(".tm-paging-link").removeClass("active");
                            $(this).addClass("active");
                            var page = $(this).eq(0).attr(pageAttribute);
                            goToPage(page);
                        });
                        $pager.appendTo($isotopePager);
                    }
                }
                $container.after($isotopePager);
            })();
        }

        setPagination();
        goToPage(1);

        $(".tm-gallery-link").click(function (e) {
            var filter = $(this).data("filter");
            currentFilter = filter;
            setPagination();
            goToPage(1);
            $(".tm-gallery-link").removeClass("active");
            $(e.currentTarget).addClass("active");
        });

        $(window).resize(function () {
            itemsPerPage = defineItemsPerPage();
            setPagination();
            goToPage(1);
        });

        $(".tm-gallery").magnificPopup({
            delegate: "a",
            type: "image",
            gallery: {
                enabled: true
            }
        });
    }

    var $trainerHero = $("#trainer-hero-img");
    var $trainerMosaic = $("#trainer-mosaic");
    if ($trainerHero.length && $trainerMosaic.length) {
        $trainerMosaic.on("click", ".trainer-shot", function () {
            var $btn = $(this);
            var src = $btn.data("full");
            if (!src || $btn.hasClass("active")) return;

            $trainerHero.css("opacity", "0.35");
            var img = new Image();
            img.onload = function () {
                $trainerHero.attr("src", src).attr("alt", $btn.find("img").attr("alt") || "Trainer photo");
                $trainerHero.css("opacity", "1");
            };
            img.src = src;

            $trainerMosaic.find(".trainer-shot").removeClass("active");
            $btn.addClass("active");
        });
    }

    /************** Levels Carousel *****************/

    if ($(".tm-carousel").length && $.fn.slick) {
        $(".tm-carousel").slick({
            dots: true,
            infinite: false,
            arrows: false,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
                {
                    breakpoint: 900,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }

    // Only bind single-page nav for in-page hash links
    if ($nav.length && $.fn.singlePageNav && $nav.find('a[href^="#"]').length) {
        $nav.singlePageNav({
            filter: ':not(.external):not([href^="http"]):not([href$=".html"])',
            offset: 72,
            currentClass: "current"
        });
    }

    // Initialize EmailJS
    if (typeof emailjs !== "undefined") {
        emailjs.init("OOUVhHMJ9FEi6VxCT");
    }

    var contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            var formData = {
                user_name: this.querySelector('[name="from_name"]').value,
                user_email: this.querySelector('[name="from_email"]').value,
                subject: this.querySelector('[name="subject"]').value,
                message: this.querySelector('[name="message"]').value
            };

            emailjs
                .send("service_x1omsib", "template_fswwt17", {
                    user_name: formData.user_name,
                    user_email: formData.user_email,
                    subject: formData.subject,
                    message: formData.message
                })
                .then(
                    function () {
                        alert("Message sent successfully!");
                        contactForm.reset();
                    },
                    function (error) {
                        alert("Failed to send message. Please try again.");
                        console.error("Error:", error);
                    }
                );
        });
    }
});

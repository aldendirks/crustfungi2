// =========================================================
// ====================  SPECIES FORMS  ====================
// =========================================================

// =========================================================
// TinyMCE init
// =========================================================
tinymce.init({
    selector: "textarea",
    height: 250,
    menubar: false,
    plugins: "link",
    toolbar: "undo redo | bold italic | link unlink",
    link_default_target: "_blank",
    link_assume_external_targets: true,
    link_title: true,
});


// =========================================================
// TinyMCE helpers for gallery forms
// =========================================================
function saveAndRemoveTinyMCE(form) {
    if (!window.tinymce) return;
    tinymce.triggerSave();
    tinymce.remove();
}

function reinitTinyMCE() {
    tinymce.init({
        selector: "textarea",
        height: 250,
        menubar: false,
        resize: true,
        plugins: "link",
        toolbar: "undo redo | bold italic | link unlink",
        link_default_target: "_blank",
        link_assume_external_targets: true,
        link_title: true,
    });
}

function saveAndRemoveSpecificTinyMCE(item) {
    if (!window.tinymce) return;
    const textarea = item.querySelector("textarea.tinymce");
    if (!textarea) return;
    
    const editor = tinymce.get(textarea.id);
    if (editor) {
        editor.save();
        editor.remove();
    }
}

function reinitSpecificTinyMCE(item) {
    if (!window.tinymce) return;
    
    const textarea = item.querySelector("textarea.tinymce");
    if (!textarea) return;
    
    tinymce.init({
        target: textarea,
        height: 250,
        menubar: false,
        resize: true,
        plugins: "link",
        toolbar: "undo redo | bold italic | link unlink",
        link_default_target: "_blank",
        link_assume_external_targets: true,
        link_title: true,
    });
}


// =========================================================
// Add new reference (AJAX)
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("literature-modal");
    const openBtn = document.getElementById("add-literature-btn");
    const cancelBtn = document.getElementById("cancel-literature");
    const saveBtn = document.getElementById("save-literature");
    const literatureContainer = document.querySelector(".literature-scroll");

    const ajaxUrl = openBtn.dataset.ajaxUrl;
    const csrfToken = modal.dataset.csrfToken;

    // -------------------------
    // Open / close modal
    // -------------------------
    openBtn.addEventListener("click", () => {
        clearLiteratureModal();
        modal.hidden = false;
    });

    cancelBtn.addEventListener("click", () => {
        modal.hidden = true;
        clearLiteratureModal();
    });

    // -------------------------
    // Save reference
    // -------------------------
    saveBtn.addEventListener("click", () => {
        clearErrors();
        saveBtn.disabled = true;

        const formData = new FormData();
        const citationContent =
            tinymce.get("id_citation").getContent();

        const pdfField = modal.querySelector('[name="pdf"]');
        const urlField = modal.querySelector('[name="url"]');

        formData.append("citation", citationContent);

        if (pdfField.files.length > 0) {
            formData.append("pdf", pdfField.files[0]);
        }

        if (urlField.value.trim() !== "") {
            formData.append("url", urlField.value);
        }

        fetch(ajaxUrl, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": csrfToken,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    displayErrors(data.errors);
                    saveBtn.disabled = false;
                    return;
                }

                const label = document.createElement("label");
                label.classList.add("literature-item");
                label.dataset.sortKey = data.sort_key;

                label.innerHTML = `
                    <input type="checkbox" name="literature" value="${data.id}" checked>
                    <span class="citation-html">${data.html}</span>
                `;

                const items = Array.from(
                    literatureContainer.querySelectorAll(".literature-item")
                );

                let inserted = false;
                for (const item of items) {
                    if (
                        label.dataset.sortKey.localeCompare(
                            item.dataset.sortKey
                        ) < 0
                    ) {
                        literatureContainer.insertBefore(label, item);
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    literatureContainer.appendChild(label);
                }

                modal.hidden = true;
                clearLiteratureModal();
                saveBtn.disabled = false;
            })
            .catch(() => {
                displayErrors({
                    __all__: ["Server error saving reference."],
                });
                saveBtn.disabled = false;
            });
    });

    // -------------------------
    // Helpers
    // -------------------------
    function clearLiteratureModal() {
        const editor = tinymce.get("id_citation");
        if (editor) editor.setContent("");

        modal.querySelector('[name="url"]').value = "";

        const pdfInput = modal.querySelector('[name="pdf"]');
        if (pdfInput) pdfInput.value = "";

        clearErrors();
    }

    function clearErrors() {
        modal.querySelectorAll(".errors").forEach((el) => el.remove());
    }

    function displayErrors(errors) {
        for (let field in errors) {
            const messages = Array.isArray(errors[field])
                ? errors[field]
                : JSON.parse(errors[field]);

            let fieldWrapper;

            if (field === "__all__") {
                fieldWrapper = document.createElement("div");
                fieldWrapper.classList.add("errors");
                fieldWrapper.innerHTML = messages
                    .map((msg) => `<li>${msg.message || msg}</li>`)
                    .join("");

                modal.prepend(fieldWrapper);
            } else {
                fieldWrapper = modal
                    .querySelector(`[name="${field}"]`)
                    ?.closest(".literature-field-wrapper");

                if (fieldWrapper) {
                    const ul = document.createElement("ul");
                    ul.classList.add("errors");
                    ul.innerHTML = messages
                        .map((msg) => `<li>${msg.message || msg}</li>`)
                        .join("");

                    fieldWrapper.appendChild(ul);
                }
            }
        }
    }
});


// =========================================================
// Sortable images in species forms
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const formset = document.getElementById("image-formset");
    const addBtn = document.getElementById("add-image-btn");
    const totalFormsInput = document.getElementById("id_images-TOTAL_FORMS");
    const emptyTemplate = document.getElementById("empty-image-form");

    const MAX_FORMS = 12;
    if (!formset || !addBtn || !totalFormsInput || !emptyTemplate) return;

    // -------------------------
    // Helper functions
    // -------------------------
    function wrapTextareaEditor(form) {
        const textarea = form.querySelector("textarea.tinymce");
        if (!textarea) return;
        const editorDiv = form.querySelector(".tox");
        if (!editorDiv) {
            setTimeout(() => wrapTextareaEditor(form), 100);
            return;
        }

        if (!textarea.parentNode.classList.contains("textarea-wrapper")) {
            const wrapper = document.createElement("div");
            wrapper.className = "textarea-wrapper";
            textarea.parentNode.insertBefore(wrapper, textarea);
            wrapper.appendChild(textarea);
            wrapper.appendChild(editorDiv);
        }
    }

    function hasUnsavedForm() {
        return formset.querySelector(".image-form.new-form") !== null;
    }

    function updateAddButtonState() {
        const visibleForms = getVisibleForms();
        console.log('updateAddButtonState: visibleForms =', visibleForms.length, 'MAX_FORMS =', MAX_FORMS, 'hasUnsavedForm =', hasUnsavedForm(), visibleForms);
        addBtn.disabled = visibleForms.length >= MAX_FORMS || hasUnsavedForm();
    }

    function updateOrderInputs() {
        let order = 0;

        formset.querySelectorAll(".image-form").forEach((item) => {
            const deleteCheckbox = item.querySelector('input[name$="-DELETE"]');
            if (deleteCheckbox?.checked) return;

            const orderInput = item.querySelector('input[name$="-order"]');
            if (orderInput) {
                orderInput.value = order;
                order++;
            }
        });

        updateMoveButtonStates();
    }

    function updateMoveButtonStates() {
        const items = formset.querySelectorAll(".image-formset-item:not([style*='display: none'])");
        
        items.forEach((item, index) => {
            const upBtn = item.querySelector(".move-up-btn");
            const downBtn = item.querySelector(".move-down-btn");
            
            if (upBtn) {
                upBtn.disabled = index === 0;
            }
            if (downBtn) {
                downBtn.disabled = index === items.length - 1;
            }
        });
    }

    function getVisibleForms() {
        const allForms = Array.from(formset.querySelectorAll('.image-form'));
        return allForms.filter(form => {
            const item = form.closest('.image-formset-item');
            return item && item.style.display !== 'none';
        });
    }

    // -------------------------
    // Add new form
    // -------------------------
    addBtn.addEventListener("click", () => {
        const visibleForms = getVisibleForms();
        console.log('Add image: totalForms =', totalFormsInput.value, 'visibleForms =', visibleForms.length, 'MAX_FORMS =', MAX_FORMS, 'hasUnsavedForm =', hasUnsavedForm(), visibleForms);
        if (visibleForms.length >= MAX_FORMS || hasUnsavedForm()) return;

        // Remove TinyMCE editors BEFORE DOM update
        saveAndRemoveTinyMCE();

        const index = parseInt(totalFormsInput.value, 10);

        const wrapper = document.createElement("div");
        wrapper.innerHTML = emptyTemplate.innerHTML.replace(/__prefix__/g, index);

        const newForm = wrapper.firstElementChild;
        newForm.classList.add("new-form");
        formset.appendChild(newForm);
        totalFormsInput.value = index + 1;

        const fileP = newForm.querySelector('input[type="file"]').closest("p");
        if (fileP) {
            const blankP = document.createElement("p");
            blankP.textContent = "Select image:";
            fileP.insertBefore(
                blankP,
                fileP.querySelector('input[type="file"]')
            );
        }

        wrapTextareaEditor(newForm);

        updateAddButtonState();
        newForm.scrollIntoView({ behavior: "smooth", block: "center" });
        updateOrderInputs();

        // Re-initialize TinyMCE AFTER DOM update
        reinitTinyMCE();
        
        // Update button states again after TinyMCE is added to DOM
        updateMoveButtonStates();
    });

    // -------------------------
    // Handle file selection
    // -------------------------
    formset.addEventListener("change", (e) => {
        if (e.target.type !== "file") return;

        const form = e.target.closest(".image-form");
        if (form) form.classList.remove("new-form");

        updateAddButtonState();
    });

    // -------------------------
    // Handle delete button
    // -------------------------
    formset.addEventListener("click", (e) => {
        if (!e.target.classList.contains("delete-image-btn")) return;

        const item = e.target.closest(".image-formset-item");
        const form = item ? item.querySelector(".image-form") : null;
        if (!form) return;

        if (form.classList.contains("new-form")) {
            console.log('Deleting new form, removing from DOM');
            form.closest(".image-formset-item").remove();
            totalFormsInput.value =
                parseInt(totalFormsInput.value, 10) - 1;
        } else {
            const deleteInput = form.querySelector('input[name$="-DELETE"]');
            if (deleteInput) deleteInput.checked = true;
            const parentItem = form.closest(".image-formset-item");
            if (parentItem) {
                parentItem.style.display = "none";
                console.log('Hiding existing form:', parentItem);
            } else {
                console.log('No parent .image-formset-item found for form', form);
            }
        }

        updateOrderInputs();
        updateAddButtonState();
    });

    // -------------------------
    // Handle move up button
    // -------------------------
    formset.addEventListener("click", (e) => {
        if (!e.target.classList.contains("move-up-btn")) return;
        e.preventDefault();

        const item = e.target.closest(".image-formset-item");
        if (!item || !item.previousElementSibling) return;

        const prevItem = item.previousElementSibling;
        saveAndRemoveSpecificTinyMCE(item);
        saveAndRemoveSpecificTinyMCE(prevItem);

        item.parentNode.insertBefore(item, prevItem);
        updateOrderInputs();

        reinitSpecificTinyMCE(item);
        reinitSpecificTinyMCE(prevItem);
        item.scrollIntoView({ behavior: "instant", block: "center" });
    });

    // -------------------------
    // Handle move down button
    // -------------------------
    formset.addEventListener("click", (e) => {
        if (!e.target.classList.contains("move-down-btn")) return;
        e.preventDefault();

        const item = e.target.closest(".image-formset-item");
        if (!item || !item.nextElementSibling) return;

        const nextItem = item.nextElementSibling;
        saveAndRemoveSpecificTinyMCE(item);
        saveAndRemoveSpecificTinyMCE(nextItem);

        item.parentNode.insertBefore(nextItem, item);
        updateOrderInputs();

        reinitSpecificTinyMCE(item);
        reinitSpecificTinyMCE(nextItem);
        item.scrollIntoView({ behavior: "instant", block: "center" });
    });

    // -------------------------
    // Initial state
    // -------------------------
    updateAddButtonState();
    updateOrderInputs();
    formset.querySelectorAll(".image-form").forEach(wrapTextareaEditor);
});


// =========================================================
// Update image preview in gallery form
// =========================================================
document.addEventListener("change", (e) => {
    if (!e.target.matches('input[type="file"][name$="-image"]')) return;

    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const imageForm = e.target.closest(".image-form");
        let img = imageForm.querySelector("img");

        if (!img) {
            img = document.createElement("img");
            imageForm.insertBefore(
                img,
                imageForm.querySelector(".field-wrapper")
            );
        }

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});


// =========================================================
// Final TinyMCE sync before form submit
// =========================================================
document.addEventListener("submit", function () {
    saveTinyMCE();
}, true);

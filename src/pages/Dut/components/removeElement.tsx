export default
    function removeSVMainMenu(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    removeById(doc, "TTKB_cboHocKy");
    removeById(doc, "SVMainMenu");
    removeByClassName(doc, "aspNetHidden")
    removeByClassName(doc, "pageHeader")
    removeByClassName(doc, "pageCaption LichKS");
    removeById(doc, "MainContent_TTKB_btnDuLieu");

    return doc.documentElement.outerHTML;
}

const removeByClassName = (doc: Document, value: string) => {
    const removeElements = doc.getElementsByClassName(value);
    Array.from(removeElements).forEach((element) => {
        element.remove();
    });
}

const removeById = (doc: Document, value: string) => {
    const removeElements = doc.getElementById(value);
    if (removeElements) {
        removeElements.remove();
    }
}

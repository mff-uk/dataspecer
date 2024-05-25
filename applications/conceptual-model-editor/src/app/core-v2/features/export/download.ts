export const useDownload = () => {
    const download = (content: string, name: string, type: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: type });
        element.href = URL.createObjectURL(file);
        element.download = name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadImage = (dataUrl: string) => {
        const a = document.createElement("a");

        a.setAttribute("download", "reactflow.svg");
        a.setAttribute("href", dataUrl);
        a.click();
    };

    return { download, downloadImage };
};

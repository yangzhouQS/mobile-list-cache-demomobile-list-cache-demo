export const addScript = (src, doc = document) => {
  return new Promise((resolve, reject) => {
    const script = doc.createElement("script");

    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", src);

    script.async = false;

    script.onload = resolve;
    script.onerror = reject;

    doc.querySelector("head").appendChild(script);
  });
};

export const addStyle = (href, doc = document) => {
  return new Promise((resolve, reject) => {
    const link = doc.createElement("link");

    link.setAttribute("href", href);
    link.setAttribute("rel", "stylesheet");

    link.onload = resolve;
    link.onerror = reject;

    doc.querySelector("head").appendChild(link);
  });
};

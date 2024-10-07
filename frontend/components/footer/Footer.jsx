const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white w3-row-padding w3-padding-32">
            <div className="w3-third">
                <p>FoodBook: Tu guía para recetas y más.</p>
            </div>

            <div className="w3-third">
                <h3>REDES SOCIALES</h3>
                <ul className="flex space-x-4">
                    <li>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                            <i className="fab fa-github text-2xl"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                            <i className="fab fa-instagram text-2xl"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                            <i className="fab fa-twitter text-2xl"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
                            <i className="fab fa-linkedin text-2xl"></i>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="w3-third w3-serif">
                <h3>TAGS POPULARES</h3>
                <p>
                    <span className="w3-tag w3-black w3-margin-bottom">Recetas</span> 
                    <span className="w3-tag w3-dark-grey w3-small w3-margin-bottom">Postres</span>
                    <span className="w3-tag w3-dark-grey w3-small w3-margin-bottom">Desayuno</span>
                    <span className="w3-tag w3-dark-grey w3-small w3-margin-bottom">Vegetariano</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;

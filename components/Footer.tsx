import React, { JSX } from "react";

export default function Footer(): JSX.Element {
	return (
		<footer className="bg-gray-100 text-center py-6 mt-8">
			<div className="container mx-auto">
				<p className="text-sm text-gray-600">© {new Date().getFullYear()} Boutique en ligne. Tous droits réservés.</p>
			</div>
		</footer>
	);
}

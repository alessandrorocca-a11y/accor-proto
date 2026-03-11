export interface VenueInfo {
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  mapQuery: string;
}

const VENUE_MAP: Record<string, VenueInfo> = {
  'Accor Arena': {
    name: 'Accor Arena',
    description: 'The Accor Arena (formerly Palais Omnisports de Paris-Bercy) is a major indoor arena located in the 12th arrondissement of Paris. With a capacity of up to 20,300 spectators, it hosts world-class concerts, sporting events, and entertainment shows throughout the year.',
    address: '8 Bd de Bercy, 75012 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=422&h=280&fit=crop',
    mapQuery: 'Accor+Arena+Paris',
  },
  'Parc des Princes': {
    name: 'Parc des Princes',
    description: 'The Parc des Princes is a football stadium in the 16th arrondissement of Paris and the home ground of Paris Saint-Germain. Built in 1972, the 47,929-capacity venue is one of Europe\'s most iconic stadiums, known for its electrifying atmosphere on match days.',
    address: '24 Rue du Commandant Guilbaud, 75016 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=422&h=280&fit=crop',
    mapQuery: 'Parc+des+Princes+Paris',
  },
  'Stade Roland-Garros': {
    name: 'Stade Roland-Garros',
    description: 'Roland-Garros is a world-renowned tennis complex located in the 16th arrondissement of Paris, home to the French Open Grand Slam tournament since 1928. The venue features the iconic Philippe-Chatrier and Suzanne-Lenglen courts surrounded by beautifully landscaped grounds.',
    address: '2 Av. Gordon Bennett, 75016 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=422&h=280&fit=crop',
    mapQuery: 'Stade+Roland+Garros+Paris',
  },
  'Institut Océanographique de Paris': {
    name: 'Institut Océanographique de Paris',
    description: 'The Institut Océanographique, also known as the Maison des Océans, is a stunning Art Nouveau building in the 5th arrondissement of Paris. Founded in 1906 by Prince Albert I of Monaco, its ornate halls provide a magnificent setting for cultural events and concerts.',
    address: '195 Rue Saint-Jacques, 75005 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=422&h=280&fit=crop',
    mapQuery: 'Institut+Océanographique+Paris',
  },
  'Institut National des Jeunes Aveugles': {
    name: 'Institut National des Jeunes Aveugles',
    description: 'The Institut National des Jeunes Aveugles is a historic institution in the 7th arrondissement of Paris, founded in 1784 by Valentin Haüy. Its elegant neoclassical chapel and salons offer an intimate and acoustically exceptional setting for concerts and cultural events.',
    address: '56 Bd des Invalides, 75007 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=422&h=280&fit=crop',
    mapQuery: 'Institut+National+des+Jeunes+Aveugles+Paris',
  },
  'Cabaret Sauvage': {
    name: 'Cabaret Sauvage',
    description: 'The Cabaret Sauvage is a circular wooden venue nestled in the Parc de la Villette in the 19th arrondissement of Paris. Inspired by travelling circuses and spiegeltents, it hosts an eclectic programme of world music, jazz, theatre, and dance performances.',
    address: '59 Bd MacDonald, 75019 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=422&h=280&fit=crop',
    mapQuery: 'Cabaret+Sauvage+Paris',
  },
  'Champs-Élysées': {
    name: 'Avenue des Champs-Élysées',
    description: 'The Avenue des Champs-Élysées is one of the most famous boulevards in the world, stretching 1.9 km from the Place de la Concorde to the Arc de Triomphe. Known as "la plus belle avenue du monde", it is the iconic setting for the Tour de France finale and national celebrations.',
    address: 'Avenue des Champs-Élysées, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=422&h=280&fit=crop',
    mapQuery: 'Champs+Elysees+Paris',
  },
  'Circuit de Monaco': {
    name: 'Circuit de Monaco',
    description: 'The Circuit de Monaco is a street circuit laid out on the roads of Monte Carlo and La Condamine around the harbour of the Principality of Monaco. Since 1929, it has hosted the Monaco Grand Prix, one of the most prestigious and technically challenging races in Formula 1.',
    address: 'Circuit de Monaco, Monte Carlo, Monaco',
    imageUrl: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=422&h=280&fit=crop',
    mapQuery: 'Circuit+de+Monaco',
  },
  'Le Golf National': {
    name: 'Le Golf National',
    description: 'Le Golf National is a premier golf facility located in Guyancourt, near Versailles. Home of the 2018 Ryder Cup and the French Open, its Albatros course is one of the most challenging and scenic championship courses in continental Europe.',
    address: '2 Av. du Golf, 78280 Guyancourt, France',
    imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=422&h=280&fit=crop',
    mapQuery: 'Le+Golf+National+Guyancourt',
  },
  'Atelier des Lumières': {
    name: 'Atelier des Lumières',
    description: 'The Atelier des Lumières is a digital art centre housed in a former iron foundry in the 11th arrondissement of Paris. Its 3,300 m² of floor-to-ceiling projections create spectacular 360° immersive exhibitions celebrating the world\'s greatest artists.',
    address: '38 Rue Saint-Maur, 75011 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=422&h=280&fit=crop',
    mapQuery: 'Atelier+des+Lumières+Paris',
  },
  'Théâtre du Lido': {
    name: 'Théâtre du Lido',
    description: 'The Théâtre du Lido, situated on the legendary Avenue des Champs-Élysées, is one of Paris\'s most iconic entertainment venues. After a stunning renovation, it now hosts world-class musicals, theatre productions, and live performances in an elegant Art Deco setting.',
    address: '116 Av. des Champs-Élysées, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=422&h=280&fit=crop',
    mapQuery: 'Lido+Paris+Champs+Elysees',
  },
  'Fondation Louis Vuitton': {
    name: 'Fondation Louis Vuitton',
    description: 'The Fondation Louis Vuitton is a striking contemporary art museum designed by Frank Gehry, located in the Bois de Boulogne. Its spectacular glass-sailed architecture houses an outstanding collection of modern and contemporary art across 11 galleries.',
    address: '8 Av. du Mahatma Gandhi, 75116 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=422&h=280&fit=crop',
    mapQuery: 'Fondation+Louis+Vuitton+Paris',
  },
  'Moulin Rouge': {
    name: 'Moulin Rouge',
    description: 'The Moulin Rouge is the world\'s most famous cabaret, located at the foot of the Montmartre hill in the 18th arrondissement of Paris. Since 1889, its legendary shows, featuring the iconic French Cancan, have dazzled audiences with breathtaking costumes and performances.',
    address: '82 Bd de Clichy, 75018 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=422&h=280&fit=crop',
    mapQuery: 'Moulin+Rouge+Paris',
  },
  'Paradis Latin': {
    name: 'Paradis Latin',
    description: 'The Paradis Latin is one of the oldest and most authentic cabarets in Paris, located in the heart of the Latin Quarter. Rebuilt by Gustave Eiffel in 1889, it offers an intimate and glamorous dinner-show experience with spectacular French cabaret performances.',
    address: '28 Rue du Cardinal Lemoine, 75005 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=422&h=280&fit=crop',
    mapQuery: 'Paradis+Latin+Paris',
  },
  'Pullman Paris Tour Eiffel': {
    name: 'Pullman Paris Tour Eiffel',
    description: 'The Pullman Paris Tour Eiffel is a premium hotel located just steps from the Eiffel Tower in the 15th arrondissement of Paris. Its panoramic rooftop restaurant, Le Frame, offers stunning views of the Parisian skyline and a refined culinary experience.',
    address: '18 Av. de Suffren, 75015 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=422&h=280&fit=crop',
    mapQuery: 'Pullman+Paris+Tour+Eiffel',
  },
  'Raffles Paris': {
    name: 'Raffles Paris',
    description: 'Raffles Paris is an ultra-luxury hotel occupying the prestigious Royal Monceau on Avenue Hoche near the Arc de Triomphe. With its Michelin-starred restaurant, world-class spa, and private art gallery, it is one of the most exclusive dining destinations in Paris.',
    address: '37 Av. Hoche, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=422&h=280&fit=crop',
    mapQuery: 'Raffles+Paris',
  },
  'Ritz Paris': {
    name: 'Ritz Paris',
    description: 'The Ritz Paris is a legendary palace hotel on the Place Vendôme, one of the most prestigious addresses in the world. Founded in 1898 by César Ritz, its Chanel au Ritz spa and Bar Hemingway are iconic destinations for luxury, elegance, and timeless Parisian glamour.',
    address: '15 Place Vendôme, 75001 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=422&h=280&fit=crop',
    mapQuery: 'Ritz+Paris+Place+Vendome',
  },
  'Four Seasons George V': {
    name: 'Four Seasons Hôtel George V',
    description: 'The Four Seasons Hôtel George V is a landmark luxury hotel just steps from the Champs-Élysées. Renowned for its Jeff Leatham flower arrangements, three Michelin-starred restaurants, and an opulent marble-columned lobby, it epitomises Parisian luxury hospitality.',
    address: '31 Av. George V, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=422&h=280&fit=crop',
    mapQuery: 'Four+Seasons+Hotel+George+V+Paris',
  },
  'Tour Eiffel': {
    name: 'Tour Eiffel',
    description: 'The Eiffel Tower, built by Gustave Eiffel for the 1889 World\'s Fair, is the most iconic landmark in Paris and one of the most visited monuments in the world. Standing 330 metres tall, its summit offers unparalleled 360° panoramic views of the entire city.',
    address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=422&h=280&fit=crop',
    mapQuery: 'Tour+Eiffel+Paris',
  },
  'Château de Versailles': {
    name: 'Château de Versailles',
    description: 'The Palace of Versailles is one of the most magnificent royal residences in the world. Built in the 17th century under Louis XIV, its breathtaking Hall of Mirrors, sumptuous State Apartments, and 800-hectare gardens attract millions of visitors every year.',
    address: 'Place d\'Armes, 78000 Versailles, France',
    imageUrl: 'https://images.unsplash.com/photo-1551279880-03041531948f?w=422&h=280&fit=crop',
    mapQuery: 'Château+de+Versailles',
  },
  'Catacombes de Paris': {
    name: 'Catacombes de Paris',
    description: 'The Catacombs of Paris are a subterranean ossuary beneath the streets of the 14th arrondissement. Holding the remains of more than six million people in a network of tunnels dating to the 18th century, they offer one of the most unique and atmospheric visits in Paris.',
    address: '1 Av. du Colonel Henri Rol-Tanguy, 75014 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=422&h=280&fit=crop',
    mapQuery: 'Catacombes+de+Paris',
  },
  'Sainte-Chapelle': {
    name: 'Sainte-Chapelle',
    description: 'The Sainte-Chapelle is a 13th-century Gothic chapel located on the Île de la Cité in the heart of Paris. Built by King Louis IX to house Christian relics, it is celebrated worldwide for its 15 magnificent stained-glass windows depicting over 1,100 biblical scenes.',
    address: '10 Bd du Palais, 75001 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=422&h=280&fit=crop',
    mapQuery: 'Sainte+Chapelle+Paris',
  },
  'Hôtel de la Marine': {
    name: 'Hôtel de la Marine',
    description: 'The Hôtel de la Marine is a magnificent 18th-century monument overlooking the Place de la Concorde. After a meticulous restoration, it offers visitors a journey through French decorative arts, with sumptuously furnished salons and a stunning loggia with views of the square.',
    address: '2 Place de la Concorde, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=422&h=280&fit=crop',
    mapQuery: 'Hôtel+de+la+Marine+Paris',
  },
  'Disneyland Paris': {
    name: 'Disneyland Paris',
    description: 'Disneyland Paris is Europe\'s most-visited theme park resort, located in Marne-la-Vallée, 32 km east of Paris. With two theme parks, Disney hotels, and Disney Village, it brings the magic of Disney to life with thrilling rides, enchanting shows, and beloved characters.',
    address: 'Bd de Parc, 77700 Coupvray, France',
    imageUrl: 'https://images.unsplash.com/photo-1587162146766-e06b1189b907?w=422&h=280&fit=crop',
    mapQuery: 'Disneyland+Paris',
  },
  'Louvre Pyramid': {
    name: 'Musée du Louvre',
    description: 'The Musée du Louvre is the world\'s largest and most visited art museum, housed in the historic Louvre Palace. Its iconic glass pyramid entrance, designed by I.M. Pei, welcomes visitors to a collection of over 380,000 objects spanning 9,000 years of civilisation.',
    address: 'Rue de Rivoli, 75001 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=422&h=280&fit=crop',
    mapQuery: 'Musée+du+Louvre+Paris',
  },
  'Cité des Sciences': {
    name: 'Cité des Sciences et de l\'Industrie',
    description: 'The Cité des Sciences et de l\'Industrie is the largest science museum in Europe, located in the Parc de la Villette in the 19th arrondissement of Paris. With interactive exhibitions, a planetarium, and an IMAX theatre, it makes science accessible and fun for all ages.',
    address: '30 Av. Corentin Cariou, 75019 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=422&h=280&fit=crop',
    mapQuery: 'Cité+des+Sciences+Paris',
  },
  'Station F': {
    name: 'Station F',
    description: 'Station F is the world\'s largest startup campus, housed in a renovated former railway freight depot in the 13th arrondissement of Paris. Spanning 34,000 m², it is home to over 1,000 startups and hosts tech events, pitch nights, and networking sessions year-round.',
    address: '5 Parvis Alan Turing, 75013 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=422&h=280&fit=crop',
    mapQuery: 'Station+F+Paris',
  },
  'Parc Astérix': {
    name: 'Parc Astérix',
    description: 'Parc Astérix is a popular French theme park in Plailly, north of Paris, themed around the beloved Asterix comic books. With over 50 attractions including roller coasters, water rides, and live shows, it celebrates Gaulish humour and adventure for all ages.',
    address: '60128 Plailly, France',
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=422&h=280&fit=crop',
    mapQuery: 'Parc+Astérix+Plailly',
  },
  'Château de Chenonceau': {
    name: 'Château de Chenonceau',
    description: 'The Château de Chenonceau, known as the "Ladies\' Castle", spans the River Cher in the Loire Valley. One of France\'s most visited and photographed châteaux, its elegant arched gallery and magnificent gardens reflect centuries of feminine influence and artistic refinement.',
    address: '37150 Chenonceaux, France',
    imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=422&h=280&fit=crop',
    mapQuery: 'Château+de+Chenonceau',
  },
  'Sofitel Quiberon Thalassa': {
    name: 'Sofitel Quiberon Thalassa Sea & Spa',
    description: 'The Sofitel Quiberon Thalassa Sea & Spa is a luxury wellness resort perched on the wild Quiberon peninsula on the Brittany coast. With direct access to the Atlantic Ocean, it offers world-class thalassotherapy treatments, yoga sessions, and panoramic ocean views.',
    address: 'Pointe de Goulvars, BP 10170, 56170 Quiberon, France',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=422&h=280&fit=crop',
    mapQuery: 'Sofitel+Quiberon+Thalassa',
  },
  'Thermes de Marlioz': {
    name: 'Thermes de Marlioz',
    description: 'The Thermes de Marlioz is a renowned thermal spa complex in the historic spa town of Aix-les-Bains, in the Savoie department near Lyon. Set in a stunning 10-hectare park, it has been providing therapeutic thermal water treatments since the 19th century.',
    address: 'Chemin des Batelières, 73100 Aix-les-Bains, France',
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=422&h=280&fit=crop',
    mapQuery: 'Thermes+de+Marlioz+Aix+les+Bains',
  },
  'Sofitel Lyon Bellecour': {
    name: 'Sofitel Lyon Bellecour',
    description: 'The Sofitel Lyon Bellecour is a luxury hotel located on the prestigious Place Bellecour, one of the largest open squares in Europe. In the heart of Lyon\'s gastronomic capital, it offers refined Lyonnaise dining experiences and elegant contemporary design.',
    address: '20 Quai Gailleton, 69002 Lyon, France',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=422&h=280&fit=crop',
    mapQuery: 'Sofitel+Lyon+Bellecour',
  },
  'Château La Coste': {
    name: 'Château La Coste',
    description: 'Château La Coste is a stunning 600-acre wine estate in Le Puy-Sainte-Réparade, near Aix-en-Provence. Combining viticulture with contemporary art, it features installations by Tadao Ando, Frank Gehry, and Louise Bourgeois amidst its Provençal vineyards.',
    address: '2750 Route de la Cride, 13610 Le Puy-Sainte-Réparade, France',
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=422&h=280&fit=crop',
    mapQuery: 'Château+La+Coste+Puy+Sainte+Réparade',
  },
  "Cité de l'Espace": {
    name: "Cité de l'Espace",
    description: "The Cité de l'Espace is a theme park and museum dedicated to space exploration, located in Toulouse, the European capital of the aerospace industry. With life-size spacecraft replicas, a planetarium, and interactive exhibits, it offers a thrilling journey through the cosmos.",
    address: 'Av. Jean Gonord, 31500 Toulouse, France',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=422&h=280&fit=crop',
    mapQuery: "Cité+de+l'Espace+Toulouse",
  },
  'Lucknam Park Hotel & Spa': {
    name: 'Lucknam Park Hotel & Spa',
    description: 'Lucknam Park is a luxury Palladian mansion hotel set in 500 acres of English countryside near Bath. The first EMBLEMS property by Accor, it offers a Michelin-starred restaurant, award-winning spa, and an acclaimed equestrian centre amidst rolling green parkland.',
    address: 'Colerne, Chippenham SN14 8AZ, United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=422&h=280&fit=crop',
    mapQuery: 'Lucknam+Park+Hotel+Spa+Colerne',
  },
  'Château de Pray': {
    name: 'Château de Pray',
    description: 'The Château de Pray is a charming 13th-century castle hotel perched above the Loire River near Amboise. Surrounded by centuries-old gardens and vineyards, it offers an intimate, romantic retreat with fine dining and spectacular views of the Loire Valley.',
    address: 'Rue du Cèdre, 37400 Amboise, France',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=422&h=280&fit=crop',
    mapQuery: 'Château+de+Pray+Amboise',
  },
  'Sambadrome Marquês de Sapucaí': {
    name: 'Marquês de Sapucaí Sambadrome',
    description: 'The Sambadrome Marquês de Sapucaí is a purpose-built parade area built for the Rio Carnival in Rio de Janeiro, Brazil. The venue is also known as Passarela Professor Darcy Ribeiro or simply the Sambódromo in Portuguese or Sambadrome in English.',
    address: 'R. Marquês de Sapucaí - Santo Cristo, Rio de Janeiro - RJ, 20220-007, Brazil',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=422&h=280&fit=crop',
    mapQuery: 'Sambódromo+da+Marquês+de+Sapucaí+Rio+de+Janeiro',
  },
  'Sofitel Paris Le Faubourg': {
    name: 'Sofitel Paris Le Faubourg',
    description: 'Sofitel Paris Le Faubourg is a luxury boutique hotel on the prestigious Rue du Faubourg Saint-Honoré, in the heart of Paris\'s fashion and art district. Its elegant interiors blend contemporary design with classic Parisian style, steps from the Élysée Palace.',
    address: '15 Rue Boissy d\'Anglas, 75008 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=422&h=280&fit=crop',
    mapQuery: 'Sofitel+Paris+Le+Faubourg',
  },
  'Novotel Paris Centre Tour Eiffel': {
    name: 'Novotel Paris Centre Tour Eiffel',
    description: 'The Novotel Paris Centre Tour Eiffel is a modern hotel in the 15th arrondissement, ideally located between the Eiffel Tower and Montparnasse. Its contemporary wellness centre and rooftop views make it a perfect base for Parisian experiences.',
    address: '61 Quai de Grenelle, 75015 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=422&h=280&fit=crop',
    mapQuery: 'Novotel+Paris+Centre+Tour+Eiffel',
  },
  'InterContinental Paris Le Grand': {
    name: 'InterContinental Paris Le Grand',
    description: 'The InterContinental Paris Le Grand is a historic luxury hotel overlooking the Opéra Garnier, one of Paris\'s most iconic buildings. With its grand Second Empire architecture and the legendary Café de la Paix, it has been welcoming guests since 1862.',
    address: '2 Rue Scribe, 75009 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=422&h=280&fit=crop',
    mapQuery: 'InterContinental+Paris+Le+Grand',
  },
  'Aquaboulevard': {
    name: 'Aquaboulevard de Paris',
    description: 'Aquaboulevard is Europe\'s largest urban water park, located in the 15th arrondissement of Paris. With tropical pools, water slides, wave pools, jacuzzis, and a vast relaxation area, it offers a year-round tropical escape in the heart of the city.',
    address: '4-6 Rue Louis Armand, 75015 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=422&h=280&fit=crop',
    mapQuery: 'Aquaboulevard+Paris',
  },
  'Parc André Citroën': {
    name: 'Parc André Citroën',
    description: 'The Parc André Citroën is a modern public park in the 15th arrondissement of Paris, built on the site of the former Citroën automobile factory. Home to the Ballon de Paris Generali, a tethered helium balloon offering panoramic views from 150 metres above the city.',
    address: '2 Rue Cauchy, 75015 Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=422&h=280&fit=crop',
    mapQuery: 'Parc+André+Citroën+Paris',
  },
  'Fontainebleau': {
    name: 'Château de Fontainebleau & Vaux-le-Vicomte',
    description: 'Two of France\'s most magnificent châteaux, located south of Paris. Fontainebleau, a UNESCO World Heritage site, was home to French monarchs for eight centuries, while Vaux-le-Vicomte inspired Versailles with its stunning baroque gardens and opulent interiors.',
    address: '77300 Fontainebleau, France',
    imageUrl: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=422&h=280&fit=crop',
    mapQuery: 'Château+de+Fontainebleau',
  },
  'Giverny': {
    name: 'Maison et Jardins de Claude Monet',
    description: 'The house and gardens of Claude Monet at Giverny are where the founder of Impressionism lived and painted for 43 years. The iconic water lily pond, Japanese bridge, and vibrant flower gardens that inspired his most famous masterpieces are preserved exactly as he designed them.',
    address: '84 Rue Claude Monet, 27620 Giverny, France',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=422&h=280&fit=crop',
    mapQuery: 'Maison+Claude+Monet+Giverny',
  },
  'Luberon': {
    name: 'Parc Naturel Régional du Luberon',
    description: 'The Luberon is a stunning natural park in the heart of Provence, famous for its lavender fields, hilltop villages, and sun-drenched vineyards. Its winding country roads through Gordes, Roussillon, and Bonnieux offer some of the most beautiful cycling routes in France.',
    address: 'Parc Naturel Régional du Luberon, 84400 Apt, France',
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=422&h=280&fit=crop',
    mapQuery: 'Luberon+Provence',
  },
};

const CITY_DEFAULTS: Record<string, VenueInfo> = {
  'Paris': {
    name: 'Paris',
    description: 'Paris, the City of Light, is one of the world\'s most beautiful and culturally rich cities. From its iconic monuments and world-class museums to its charming neighbourhoods and legendary gastronomy, Paris offers an unparalleled backdrop for extraordinary experiences.',
    address: 'Paris, France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=422&h=280&fit=crop',
    mapQuery: 'Paris+France',
  },
  'Lyon': {
    name: 'Lyon',
    description: 'Lyon, France\'s gastronomic capital, is a vibrant city at the confluence of the Rhône and Saône rivers. A UNESCO World Heritage site, it is celebrated for its Renaissance architecture, legendary bouchons, and thriving cultural scene.',
    address: 'Lyon, France',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=422&h=280&fit=crop',
    mapQuery: 'Lyon+France',
  },
  'Marseille': {
    name: 'Marseille',
    description: 'Marseille, France\'s oldest and second-largest city, sits on the stunning Mediterranean coast. With its vibrant Vieux-Port, the iconic Calanques national park, and a rich multicultural heritage, it offers a unique blend of maritime charm and cosmopolitan energy.',
    address: 'Marseille, France',
    imageUrl: 'https://images.unsplash.com/photo-1535756538712-74c504f0c5c0?w=422&h=280&fit=crop',
    mapQuery: 'Marseille+France',
  },
  'Nice': {
    name: 'Nice & the French Riviera',
    description: 'Nice, the jewel of the French Riviera, is famed for its stunning Promenade des Anglais, turquoise Mediterranean waters, and vibrant old town. Gateway to Monaco and the Côte d\'Azur, it combines Belle Époque elegance with a relaxed Mediterranean lifestyle.',
    address: 'Nice, France',
    imageUrl: 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=422&h=280&fit=crop',
    mapQuery: 'Nice+France',
  },
  'Toulouse': {
    name: 'Toulouse',
    description: 'Toulouse, the "Pink City", is the capital of the Occitanie region in southwestern France. Known for its distinctive rose-coloured brick architecture, its role as the European aerospace capital, and its vibrant student culture, it blends heritage with innovation.',
    address: 'Toulouse, France',
    imageUrl: 'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?w=422&h=280&fit=crop',
    mapQuery: 'Toulouse+France',
  },
  'Rio de Janeiro': {
    name: 'Rio de Janeiro',
    description: 'Rio de Janeiro, the "Cidade Maravilhosa" (Marvellous City), is famed for its breathtaking natural setting between mountains and sea. From the iconic Christ the Redeemer statue to Copacabana Beach, Rio pulses with samba rhythms, carnival spirit, and tropical energy.',
    address: 'Rio de Janeiro, Brazil',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=422&h=280&fit=crop',
    mapQuery: 'Rio+de+Janeiro+Brazil',
  },
};

export function getVenueInfo(location: string, city: string): VenueInfo {
  for (const [key, venue] of Object.entries(VENUE_MAP)) {
    if (location.includes(key)) return venue;
  }

  return CITY_DEFAULTS[city] ?? CITY_DEFAULTS['Paris'];
}

export function getMapEmbedUrl(venue: VenueInfo): string {
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${venue.mapQuery}`;
}

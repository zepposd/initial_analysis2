

import React from 'react';

const ScreenshotPlaceholder: React.FC<{ title: string; description: string, className?: string }> = ({ title, description, className = '' }) => (
    <div className={`bg-primary dark:bg-[#0D1117] border-2 border-dashed border-border-color dark:border-[#30363D] rounded-lg p-4 my-4 ${className}`}>
        <div className="flex items-center pb-2 mb-2 border-b border-border-color dark:border-[#30363D]">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1.5"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1.5"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="ml-3 text-sm font-semibold text-text-secondary dark:text-[#8B949E]">{title}</p>
        </div>
        <p className="text-center text-text-secondary dark:text-[#8B949E] italic text-sm">{description}</p>
    </div>
);

const chapters = [
    { id: 'welcome', title: 'Καλώς ήρθατε!' },
    { id: 'ui-overview', title: 'Κεφάλαιο 1: Περιβάλλον Εργασίας' },
    { id: 'getting-started', title: 'Κεφάλαιο 2: Πρώτα Βήματα' },
    { id: 'digitization', title: 'Κεφάλαιο 3: Ψηφιοποίηση & Ανέβασμα' },
    { id: 'file-management', title: 'Κεφάλαιο 4: Διαχείριση Αρχείων' },
    { id: 'file-editing', title: 'Κεφάλαιο 5: Επεξεργασία Αρχείου' },
    { id: 'settings', title: 'Κεφάλαιο 6: Ρυθμίσεις' },
    { id: 'exporting', title: 'Κεφάλαιο 7: Εξαγωγή Δεδομένων' },
    { id: 'tips', title: 'Κεφάλαιο 8: Συμβουλές & Εργαλεία' },
];

const UserGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, chapterId: string) => {
        e.preventDefault();
        const element = document.getElementById(chapterId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 bg-primary dark:bg-[#0D1117] bg-opacity-95 dark:bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
            <div className="bg-secondary dark:bg-[#161B22] rounded-lg shadow-xl w-[95%] h-[95%] flex flex-col border border-border-color dark:border-[#30363D]" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-border-color dark:border-[#30363D] flex-shrink-0">
                    <h1 className="text-2xl font-bold text-text-primary dark:text-[#C9D1D9]">Οδηγός Χρήσης DocuDigitize AI</h1>
                    <button onClick={onClose} className="bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-500 dark:hover:bg-blue-400">Κλείσιμο</button>
                </header>
                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar Navigation */}
                    <nav className="w-1/4 p-6 border-r border-border-color dark:border-[#30363D] overflow-y-auto flex-shrink-0 hidden md:block">
                        <h2 className="text-lg font-bold mb-4 text-text-primary dark:text-[#C9D1D9]">Περιεχόμενα</h2>
                        <ul className="space-y-2">
                            {chapters.map(chapter => (
                                <li key={chapter.id}>
                                    <a 
                                        href={`#${chapter.id}`}
                                        onClick={(e) => handleNavClick(e, chapter.id)}
                                        className={`block w-full text-left p-2 rounded-md text-sm transition-colors text-text-secondary dark:text-[#8B949E] hover:bg-primary dark:hover:bg-[#0D1117]`}
                                    >
                                        {chapter.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    
                    {/* Main Content */}
                    <main className="flex-grow overflow-y-auto p-8 space-y-12 text-text-primary dark:text-[#C9D1D9] scroll-smooth">
                        <section id="welcome">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] mb-3">Καλώς ήρθατε!</h2>
                            <p className="text-text-secondary dark:text-[#8B949E] leading-relaxed">Αυτός ο οδηγός θα σας βοηθήσει να αξιοποιήσετε πλήρως τις δυνατότητες του DocuDigitize AI. Η εφαρμογή έχει σχεδιαστεί για να απλοποιήσει τη διαδικασία ψηφιοποίησης, εξαγωγής μεταδεδομένων και σύνοψης των εγγράφων σας χρησιμοποιώντας προηγμένη τεχνητή νοημοσύνη.</p>
                        </section>
                        
                        <section id="ui-overview">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 1: Περιβάλλον Εργασίας</h2>
                            <h3 className="text-xl font-bold mb-2">1.1 Κύρια Πλοήγηση</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Στην αριστερή πλευρά της οθόνης βρίσκεται η κάθετη μπάρα πλοήγησης, η οποία είναι πάντα ορατή. Από εκεί, μπορείτε να μεταβείτε στις κύριες ενότητες της εφαρμογής: Ανέβασμα, Αρχεία Κειμένου, και Ρυθμίσεις.</p>
                             <h3 className="text-xl font-bold mt-8 mb-2">1.2 Εναλλαγή Θέματος (Dark/Light Mode)</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Στο κάτω μέρος της αριστερής μπάρας πλοήγηση, θα βρείτε ένα κουμπί με εικονίδιο ήλιου/φεγγαριού. Χρησιμοποιήστε το για να αλλάξετε άμεσα την εμφάνιση της εφαρμογής μεταξύ σκούρου (dark mode) και φωτεινού (light mode) θέματος. Η επιλογή σας αποθηκεύεται.</p>
                        </section>

                        <section id="getting-started">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 2: Πρώτα Βήματα</h2>
                            <h3 className="text-xl font-bold mb-2">2.1 Είσοδος & Επιλογή Χρήστη</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Κατά την έναρξη της εφαρμογής, θα σας ζητηθεί να επιλέξετε έναν χρήστη. Εάν υπάρχουν αποθηκευμένοι χρήστες από προηγούμενες συνεδρίες, μπορείτε να επιλέξετε το όνομά σας από μια αναπτυσσόμενη λίστα για γρήγορη πρόσβαση. Εναλλακτικά, μπορείτε να δημιουργήσετε έναν νέο χρήστη. Κάθε νέος χρήστης που δημιουργείτε προστίθεται αυτόματα στη λίστα για μελλοντική χρήση. Το όνομα συνδέεται με όλα τα αρχεία που ανεβάζετε, επιτρέποντας την εύκολη παρακολούθηση.</p>
                            
                            <h3 className="text-xl font-bold mt-8 mb-2">2.2 API Key</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Για τη λειτουργία της εφαρμογής απαιτείται ένα κλειδί API του Google Gemini. Εάν δεν έχετε ήδη εισάγει ένα, θα εμφανιστεί ένα παράθυρο για να το κάνετε. Το κλειδί αποθηκεύεται μόνο προσωρινά στον browser σας.</p>
                        </section>
                        
                        <section id="digitization">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 3: Ψηφιοποίηση & Ανέβασμα</h2>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-4 leading-relaxed">Αυτή είναι η κύρια σελίδα όπου μπορείτε να ανεβάσετε και να επεξεργαστείτε τα αρχεία σας.</p>
                            
                            <h3 className="text-xl font-bold mb-2">3.1 Διαδικασία Ανεβάσματος & Επεξεργασίας</h3>
                            <ol className="list-decimal list-inside text-text-secondary dark:text-[#8B949E] space-y-3 pl-4">
                                <li><strong>Επιλογή Αρχείου:</strong> Κάντε κλικ στην περιοχή ανεβάσματος ή σύρετε ένα ή περισσότερα αρχεία (PNG, JPG, PDF) μέσα σε αυτή.</li>
                                <li><strong>Αυτόματη Επεξεργασία με AI:</strong> Η εφαρμογή ξεκινά αμέσως την επεξεργασία του πρώτου αρχείου στην ουρά. Η AI εκτελεί τις εξής ενέργειες:
                                    <ul className="list-disc list-inside pl-6 mt-2 space-y-1">
                                        <li><strong>OCR:</strong> Εξαγωγή κειμένου από την εικόνα.</li>
                                        <li><strong>Σύνοψη:</strong> Δημιουργία μιας σύντομης περίληψης στα Ελληνικά.</li>
                                        <li><strong>Αναγνώριση Γλώσσας:</strong> Εντοπισμός της πρωτότυπης γλώσσας του κειμένου.</li>
                                        <li><strong>Εξαγωγή Μεταδεδομένων:</strong> Εντοπισμός τιμών για τα προκαθορισμένα μεταδεδομένα (π.χ., Ημερομηνία).</li>
                                    </ul>
                                </li>
                                <li><strong>Έλεγχος & Τροποποίηση:</strong> Ελέγξτε τα αποτελέσματα της AI. Στην ενότητα "Μεταδεδομένα", μπορείτε να συμπληρώσετε ή να διορθώσετε τα πεδία.</li>
                                <li><strong>Αποθήκευση:</strong> Πατήστε "Αποθήκευση & Συνέχεια" για να καταχωρήσετε το έγγραφο και να προχωρήσετε στο επόμενο στην ουρά, ή "Αποθήκευση" αν ήταν το τελευταίο.</li>
                            </ol>
                            <ScreenshotPlaceholder title="Σελίδα Ανεβάσματος - Μετά την Επεξεργασία" description="Η οθόνη χωρίζεται σε δύο κύρια μέρη: 1. Το πλαίσιο ανεβάσματος και η λίστα πρόσφατων αρχείων. 2. Τα αποτελέσματα της AI (Σύνοψη, OCR) και τα πεδία μεταδεδομένων για έλεγχο από τον χρήστη." />
                        </section>

                        <section id="file-management">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 4: Διαχείριση Αρχείων</h2>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Εδώ μπορείτε να δείτε όλα τα αποθηκευμένα αρχεία σας, να κάνετε αναζήτηση και να διαχειριστείτε την αρχειοθέτησή τους.</p>
                            
                            <h3 className="text-xl font-bold mb-2">4.1 Έξυπνη Αναζήτηση</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Χρησιμοποιήστε τη γραμμή "Έξυπνη Αναζήτηση" για να κάνετε ερωτήσεις στη φυσική γλώσσα. Η AI θα ψάξει στο περιεχόμενο, τη σύνοψη και τα μεταδεδομένα όλων των αρχείων για να βρει τα πιο σχετικά αποτελέσματα.</p>
                             <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-2 pl-4 mb-4">
                                <li><strong>Παράδειγμα ερωτήματος:</strong> <em>"Βρες μου έγγραφα από το 1970 που μιλούν για εργατικά ατυχήματα στη Γερμανία."</em></li>
                            </ul>

                             <h3 className="text-xl font-bold mt-8 mb-2">4.2 Κατάσταση Αρχειοθέτησης</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Δίπλα σε κάθε αρχείο, θα βρείτε ένα dropdown με δύο επιλογές:</p>
                             <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-2 pl-4 mb-4">
                                <li><strong>Διατηρείται στο αρχείο:</strong> (Προεπιλογή) Το αρχείο θεωρείται έγκυρο και θα συμπεριληφθεί στα backups.</li>
                                <li><strong>Εξαιρείται από το αρχείο:</strong> Το αρχείο μαρκάρεται ως εξαιρούμενο. Θα εμφανίζεται με πιο αχνό χρώμα στη λίστα και <strong>δεν θα συμπεριλαμβάνεται στα backups</strong>. Αυτό είναι χρήσιμο για να "καθαρίσετε" το σύνολο δεδομένων σας χωρίς να διαγράψετε οριστικά τα αρχεία.</li>
                            </ul>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Δίπλα στο dropdown, εμφανίζεται το όνομα του χρήστη που ανέβασε το αρχείο.</p>

                            <h3 className="text-xl font-bold mt-8 mb-2">4.3 Backup, Επαναφορά & Συγχώνευση</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Στο κάτω μέρος της σελίδας θα βρείτε τρία σημαντικά κουμπιά διαχείρισης δεδομένων:</p>
                             <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-3 pl-4">
                                <li><strong>Εφεδρικό Αντίγραφο:</strong> Δημιουργεί ένα αρχείο <code>.json</code> που περιέχει ΟΛΑ τα δεδομένα σας που είναι μαρκαρισμένα ως "Διατηρείται".</li>
                                <li><strong>Επαναφορά:</strong> Αντικαθιστά ΠΛΗΡΩΣ όλα τα τρέχοντα δεδομένα σας με τα περιεχόμενα ενός αρχείου backup.</li>
                                <li><strong>Συγχώνευση (Merge):</strong> Προσθέτει έξυπνα μόνο τα νέα δεδομένα από ένα αρχείο backup, χωρίς να διαγράφει ή να αντικαθιστά τα υπάρχοντα.</li>
                            </ul>
                        </section>

                        <section id="file-editing">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 5: Επεξεργασία Αρχείου</h2>
                             <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Κάνοντας κλικ στο όνομα ενός αρχείου, μεταφέρεστε στη σελίδα επεξεργασίας. Εδώ μπορείτε να δείτε και να τροποποιήσετε όλες τις πληροφορίες που σχετίζονται με το συγκεκριμένο έγγραφο.</p>
                             <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-2 pl-4">
                                 <li><strong>Διόρθωση Κειμένου/Σύνοψης:</strong> Μπορείτε να διορθώσετε τυχόν λάθη στο εξαγόμενο κείμενο (OCR) ή να βελτιώσετε τη σύνοψη.</li>
                                 <li><strong>Ενημέρωση Μεταδεδομένων:</strong> Συμπληρώστε ή αλλάξτε τα μεταδεδομένα.</li>
                                 <li><strong>Μετάφραση:</strong> Χρησιμοποιήστε τα κουμπιά μετάφρασης για να δημιουργήσετε μια Αγγλική ή Ελληνική εκδοχή του πρωτότυπου κειμένου.</li>
                             </ul>
                        </section>
                        
                        <section id="settings">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 6: Ρυθμίσεις</h2>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Εδώ διαμορφώνετε τη δομή των μεταδεδομένων και διαχειρίζεστε τους χρήστες της εφαρμογής.</p>

                            <h3 className="text-xl font-bold mb-2">6.1 Διαχείριση Τίτλων Μεταδεδομένων</h3>
                             <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Διαχειριστείτε τα πεδία μεταδεδομένων που θα αναζητά η AI στα έγγραφά σας. Μπορείτε να προσθέσετε, να διαγράψετε ή να μετονομάσετε τίτλους. Μπορείτε επίσης να χρησιμοποιήσετε την AI, επικολλώντας ένα δείγμα κειμένου, για να σας προτείνει σχετικούς τίτλους μεταδεδομένων.</p>
                             <p className="text-text-secondary dark:text-[#8B949E] leading-relaxed">Οι αλλαγές σας αποθηκεύονται αυτόματα μετά από λίγα δευτερόλεπτα αδράνειας.</p>
                            
                            <h3 className="text-xl font-bold mt-8 mb-2">6.2 Διαχείριση Χρηστών</h3>
                            <p className="text-text-secondary dark:text-[#8B949E] leading-relaxed">Σε αυτή την ενότητα, μπορείτε να διαχειριστείτε τα προφίλ χρηστών που είναι αποθηκευμένα στην εφαρμογή. Μπορείτε να δείτε τη λίστα όλων των υπαρχόντων χρηστών, να προσθέσετε νέους χρήστες χειροκίνητα ή να διαγράψετε χρήστες που δεν χρειάζονται πλέον. Αυτό παρέχει ένα κεντρικό σημείο για τη διατήρηση της λίστας των χρηστών που μπορούν να επιλεγούν κατά την εκκίνηση.</p>
                        </section>
                        
                        <section id="exporting">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 7: Εξαγωγή Δεδομένων</h2>
                            <p className="text-text-secondary dark:text-[#8B949E] mb-3 leading-relaxed">Από τη σελίδα "Αρχεία Κειμένου", το κουμπί "Εξαγωγή Αρχείων" ανοίγει ένα παράθυρο όπου μπορείτε να επιλέξετε ποια αρχεία θέλετε να εξάγετε και σε ποια μορφή.</p>
                            <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-3 pl-4">
                                <li><strong>Εξαγωγή (.txt):</strong> Δημιουργεί ένα ενιαίο, ευανάγνωστο αρχείο κειμένου που περιέχει όλες τις πληροφορίες για τα επιλεγμένα έγγραφα.</li>
                                <li><strong>Εξαγωγή (.csv):</strong> Δημιουργεί ένα λεπτομερές αρχείο CSV, κατάλληλο για προγράμματα όπως το Excel, που περιλαμβάνει όλες τις πληροφορίες, συμπεριλαμβανομένων όλων των πεδίων μεταδεδομένων.</li>
                                <li><strong>Εξαγωγή (.xlsx):</strong> Δημιουργεί ένα αρχείο Excel (.xlsx) με μια σύνοψη των επιλεγμένων αρχείων που είναι μαρκαρισμένα ως "Διατηρείται στο αρχείο". Οι στήλες είναι: "Όνομα Αρχείου", "Χρήστης" και "Ημερομηνία Εισαγωγής".</li>
                            </ul>
                        </section>

                        <section id="tips">
                            <h2 className="text-2xl font-semibold text-accent dark:text-[#58A6FF] border-b border-border-color dark:border-[#30363D] pb-2 mb-4">Κεφάλαιο 8: Συμβουλές & Εργαλεία</h2>
                            <ul className="list-disc list-inside text-text-secondary dark:text-[#8B949E] space-y-3 pl-4">
                                <li><strong>Ποιότητα Εικόνας:</strong> Για καλύτερα αποτελέσματα OCR, χρησιμοποιήστε εικόνες υψηλής ανάλυσης με καθαρό, ευανάγνωστο κείμενο.</li>
                                <li><strong>Αποθήκευση:</strong> Πριν αποσυνδεθείτε, η εφαρμογή θα σας προτείνει να δημιουργήσετε ένα εφεδρικό αντίγραφο. Είναι καλή πρακτική να το κάνετε τακτικά.</li>
                            </ul>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};
export default UserGuide;
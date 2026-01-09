# Remove bounding <p> tags from literature entries
# Run from crustfungi2 project dir with
#   python manage.py shell < utilities/fix_citations.py

from literature.models import LiteratureEntry
from bs4 import BeautifulSoup

for entry in LiteratureEntry.objects.all():
    soup = BeautifulSoup(entry.citation, "html.parser")

    # If citation is exactly one <p> wrapper
    if (
        len(soup.contents) == 1
        and soup.contents[0].name == "p"
    ):
        entry.citation = soup.contents[0].decode_contents()
        entry.save(update_fields=["citation"])
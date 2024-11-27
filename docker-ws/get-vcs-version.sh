COMMIT=`git rev-parse HEAD`
DATE=`git log -1 --format=%cd --date=iso`
NUMBER=`git rev-list --count HEAD`

echo $COMMIT,$DATE,$NUMBER
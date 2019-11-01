(ql:quickload '(:hunchentoot :cl-who :cl-json :easy-routes))

(defpackage :core
  (:use :cl :cl-who :hunchentoot :cl-json :easy-routes))

(in-package :core)

(defconstant +chunk-size+ 16)
(defconstant +world-side-length+ (expt 2 30))
(defconstant +mine-probability+ (/ 2 10))
(defconstant +user-actions+ '(new-connection request reveal decorate))
(defconstant +directions+ '(north northwest west southwest south southeast east northeast))

(defun uniform ()
  "Get a random number in [0, 1)"
  (let ((m (expt 2 31)))
    (/ (random m) m)))

(defclass chunk ()
  ((id :reader chunk-id
       :initarg :id)
   (mines :reader chunk-mines
	  :initform
	  (make-array +chunk-size+
		      :initial-contents (loop repeat +chunk-size+
					   collect (< (uniform) +mine-probability+))))
   (actions :accessor chunk-actions
	    :initform '())))

(defvar *chunks* '())
(defvar *users* '())

(defun get-chunk (n)
  "Returns chunk with id N.  If that chunk doesn't exist it is generated."
  (let ((res (find-if (lambda (c) (eq n (chunk-id c))) *chunks*)))
    (if res
	res
	(progn
	  (push (make-instance 'chunk :id n) *chunks*)
	  (car *chunks*)))))

(defun north (n &optional (s +world-side-length+))
  (- n s))

(defun east (n)
  (- n 1))

(defun south (n &optional (s +world-side-length+))
  (+ n s))

(defun west (n)
  (+ n 1))

(defun northwest (n) (north (west n)))
(defun northeast (n) (north (east n)))
(defun southwest (n) (south (west n)))
(defun southeast (n) (south (east n)))
(defun flatten (x &optional stack out)
  (cond ((consp x) (flatten (cdr x) (cons (car x) stack) out))
	(x         (flatten (car stack) (cdr stack) (cons x out)))
	(stack     (flatten (car stack) (cdr stack) out))
	(t out)))

(defun iota (start stop step)
  (if (>= start stop)
      nil
      (cons start (iota (+ start step) stop step))))

(defun +- (x a)
  (cons (- x a) (+ x a)))

(defparameter *acceptor* (make-instance 'easy-routes-acceptor :port 3000))

;; need object containing list of addChunk actions.
;; each action has a chunk with id, neighbors, and tiles.
(defun handle-new-connection ()
  (setf (hunchentoot:content-type*) "text/json")
  )

;; TODO: Bias rng to favor middle of map
(defun new-connection (radius &optional (center (random (expt +world-side-length+ 2))))
  "Return a square of chunks with specified RADIUS."
  (let* ((cids (new-connection-chunks radius center))
	 (cids-neighbors (mapcar #'chunk-neighbors cids))
	 (chunks (mapcar #'get-chunk cids)))
    (mapcar (lambda (cid neighbors chunks)
	      (list (cons 'id cid)
		    (cons 'neighbors neighbors)
		    (cons 'tiles (chunk-mines chunks))))
	    cids cids-neighbors chunks)))

(defun new-connection-chunks (radius center)
  "Return a list of cids such that its a square with center CENTER
and sidelength 2 * RADIUS + 1"
  (let* ((s +world-side-length+)
	 (middle-upper (- center (* radius s))))
    (let ((upper-row (iota (- middle-upper radius)
			   (+ middle-upper radius 1)
			   1)))
      (apply #'append (mapcar (lambda (i)
				(iota i (+ i (* s (length upper-row))) s))
			      upper-row)))))

(defun reveal (cid tid uid)
  "Reveal chunk CID, tile TID, giving ownership to user UID.")

(defconstant +tile-positions+
  (mapcar #'cons
	  (iota 0 +chunk-size+ 1)
	  (mapcar (lambda (i)
		    (or (tile-cornerp i) (tile-boundaryp i) (tile-innerp i)))
		  (iota 0 +chunk-size+ 1)))
  "alist of tile ids to their relative position in the chunk.")

(defconstant +tile-neighbors-handlers+
  (let* ((s (floor (sqrt +chunk-size+)))
	 (nw 0)             (ne (- s 1))
	 (sw (- (* s s) s)) (se (- (* s s) 1)))
    (list
     (cons 'northwest (lambda (cid _)
			(list (cons cid             (list 1 s (+ s 1)))
			      (cons (north cid)     (list sw (+ sw 1)))
			      (cons (northwest cid) (list se))
			      (cons (west cid)      (list ne (+ ne s))))))
     (cons 'northeast (lambda (cid _)
			(list (cons cid             (list (- ne 1) (+ ne s -1) (+ ne s)))
			      (cons (north cid)     (list se (- se 1)))
			      (cons (northeast cid) (list sw))
			      (cons (east cid)      (list nw (+ nw s))))))
     (cons 'southeast (lambda (cid _)
			(list (cons cid             (list (- sw s) (- sw s -1) (+ sw 1)))
			      (cons (south cid)     (list nw (+ nw 1)))
			      (cons (southwest cid) (list ne))
			      (cons (west cid)      (list se (- se s))))))
     (cons 'southwest (lambda (cid _)
			(list (cons cid             (list (- sw s 1) (- sw s) (+ sw 1)))
			      (cons (south cid)     (list nw (+ nw 1)))
			      (cons (southeast cid) (list ne))
			      (cons (east cid)      (list se (- se s))))))
     (cons 'north     (lambda (cid tid s)
			(list (cons cid         (list (- tid 1) (+ tid 1) (+ tid s -1)
						      (+ tid s) (+ tid s 1)))
			      (cons (north cid) (let ((b (+ (* s s) (- s) tid)))
						  (list (- b 1) b (+ b 1)))))))
     (cons 'east      (lambda (cid tid s)
			(list (cons cid         (list (- tid s 1) (- tid s) (+ tid s -1)
						      (+ tid s -1) (+ tid s)))
			      (cons (east cid)  (let ((b (+ tid (- s) tid)))
						  (list (- b s) b (+ b s)))))))
     (cons 'south     (lambda (cid tid s)
			(list (cons cid         (list (- tid 1) (+ tid 1) (- tid s 1)
						      (- tid s) (- tid s -1)))
			      (cons (north cid) (let ((b (mod tid s)))
						  (list (- b 1) b (+ b 1)))))))
     (cons 'west      (lambda (cid tid s)
			(list (cons cid         (list (- tid s) (+ tid (- s) 1) (+ tid 1) (+ tid s) (+ tid s 1)))
			      (cons (west cid)  (let ((b (+ tid s -1)))
						  (list (- b s) b (+ b s)))))))
     (cons 'inner     (lambda (cid tid s)
			(list (cons cid (list (- tid s 1)  (- tid s) (+ tid (- s) 1)
					      (- tid 1)    (+ tid 1)
					      (+ tid s -1) (+ tid s) (+ tid s 1))))))))
  "TODO")

(defun tile-neighbors (cid tid &optional (s (floor (sqrt +chunk-size+))))
  "Return the 8 adjacent tiles to (CID TID)."
  
)

(defun tile-cornerp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Returns DIRECTION when TID is on a corner, otherwise NIL."
  (let ((corners (list (cons 0 'northwest) (cons (- s 1) 'northeast)
		       (cons (- (* s s) s) 'southwest) (cons (- (* s s) 1) 'southeast))))
    (cdr (assoc tid corners))))

(defun tile-boundaryp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Returns DIRECTION when TID is on a chunk boundary, otherwise NIL."
  (cond ((< tid s) 'north)
	((zerop (mod tid s)) 'west)
	((zerop (mod (1+ tid) s)) 'east)
	((> tid (- (* s s) s 1)) 'south)
	(t nil)))

(defun tile-innerp (tid &optional (s (floor (sqrt +chunk-size+))))
  "Return 'inner when TID is not on a chunk boundary."
  (when (funcall (complement #'tile-boundaryp) tid s)
    'inner))

(defun chunk-neighbors (cid)
  "Return a list of neighboring chunk cids to CID beginning with north
and going counter-clockwise."
  (list (north cid) (west (north cid))
	(west cid)  (west (south cid))
	(south cid) (east (south cid))
	(east cid)  (east (north cid))))

(defroute test ("/test" :method :get) ()
  (setf (content-type*) "text/json")
  'hello)

(push (create-prefix-dispatcher "/api/new_connection" #'handle-new-connection) *dispatch-table*)
(pop *dispatch-table*)
